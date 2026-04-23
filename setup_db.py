#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
setup_db.py
Automatiza a criação de tabelas e a carga inicial de dados
a partir do schema.sql no banco SQLite existente.
"""

import re
import sqlite3
from pathlib import Path

DB_PATH = Path("novo banco pizza.db")
SCHEMA_PATH = Path("schema.sql")


def mysql_to_sqlite(sql: str) -> str:
    """
    Converte comandos DDL/DML de MySQL para SQLite compatível.
    """
    # Remove comentários de bloco /* ... */ (se houver)
    sql = re.sub(r"/\*.*?\*/", "", sql, flags=re.DOTALL)

    # Remove linhas de comentário -- ... (preserva dentro de strings simples)
    lines = []
    for line in sql.splitlines():
        stripped = line.strip()
        if stripped.startswith("--"):
            continue
        # remove comentário inline --  (aproximação segura para DDL)
        if "--" in line:
            line = line.split("--", 1)[0]
        lines.append(line)
    sql = "\n".join(lines)

    # Substituições de tipo / sintaxe
    replacements = [
        # AUTO_INCREMENT no MySQL → AUTOINCREMENT no SQLite
        (r"INT\s+AUTO_INCREMENT\s+PRIMARY\s+KEY", "INTEGER PRIMARY KEY AUTOINCREMENT"),
        (r"INTEGER\s+AUTO_INCREMENT\s+PRIMARY\s+KEY", "INTEGER PRIMARY KEY AUTOINCREMENT"),
        (r"AUTO_INCREMENT", "AUTOINCREMENT"),
        # Tipos numéricos
        (r"DECIMAL\s*\(\s*\d+\s*,\s*\d+\s*\)", "REAL"),
        (r"DOUBLE\s*\(\s*\d+\s*,\s*\d+\s*\)", "REAL"),
        (r"FLOAT\s*\(\s*\d+\s*,\s*\d+\s*\)", "REAL"),
        # VARCHAR / CHAR → TEXT
        (r"VARCHAR\s*\(\s*\d+\s*\)", "TEXT"),
        (r"CHAR\s*\(\s*\d+\s*\)", "TEXT"),
        # DATETIME → TEXT (SQLite não tem tipo nativo, mas aceita; TEXT é mais explícito)
        (r"\bDATETIME\b", "TEXT"),
        # INT genérico → INTEGER
        (r"\bINT\b", "INTEGER"),
    ]

    for pattern, repl in replacements:
        sql = re.sub(pattern, repl, sql, flags=re.IGNORECASE)

    # Limpa espaços excessivos
    sql = re.sub(r"\s+", " ", sql)
    return sql.strip()


def split_statements(sql: str):
    """Divide o SQL em comandos individuais, respeitando aspas simples."""
    statements = []
    current = []
    in_quote = False
    i = 0
    while i < len(sql):
        ch = sql[i]
        if ch == "'":
            in_quote = not in_quote
            current.append(ch)
        elif ch == ";" and not in_quote:
            stmt = "".join(current).strip()
            if stmt:
                statements.append(stmt)
            current = []
        else:
            current.append(ch)
        i += 1
    # Último statement sem ponto-e-vírgula final
    stmt = "".join(current).strip()
    if stmt:
        statements.append(stmt)
    return statements


def _create_estoque_table(conn: sqlite3.Connection):
    """Cria a tabela de estoque se não existir e popula com dados iniciais."""
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS estoque (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE,
            quantidade_atual INTEGER NOT NULL DEFAULT 0,
            quantidade_minima INTEGER NOT NULL DEFAULT 0
        )
    """)
    conn.commit()

    initial_stock = [
        ("Margherita Premium", 12, 20),
        ("Calabresa Especial", 45, 20),
        ("Frango BBQ", 28, 15),
        ("Quatro Queijos", 33, 25),
        ("Chocolate Morango", 18, 10),
        ("Prime Especial", 22, 20),
        ("Pepperoni", 30, 15),
        ("Portuguesa", 25, 20),
        ("Mussarela", 40, 20),
        ("Atum", 15, 15),
        ("Baiana", 20, 15),
        ("Caipira", 18, 15),
        ("Brocolis com Bacon", 10, 12),
        ("Milho com Bacon", 22, 15),
        ("Carne Seca com Catupiry", 8, 10),
        ("Escarola com Alho", 14, 12),
        ("Toscana", 19, 15),
        ("Lombo Canadense", 16, 12),
        ("Presunto de Parma com Rucula", 7, 10),
        ("Queijo Brie com Damasco", 9, 10),
        ("Tomate Seco com Rucula", 11, 10),
    ]

    for nome, atual, minima in initial_stock:
        try:
            cursor.execute(
                "INSERT INTO estoque (nome, quantidade_atual, quantidade_minima) VALUES (?, ?, ?)",
                (nome, atual, minima)
            )
        except sqlite3.IntegrityError:
            pass
    conn.commit()


def run_setup():
    if not SCHEMA_PATH.exists():
        raise FileNotFoundError(f"Arquivo {SCHEMA_PATH} não encontrado.")

    raw_sql = SCHEMA_PATH.read_text(encoding="utf-8")
    converted = mysql_to_sqlite(raw_sql)
    statements = split_statements(converted)

    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()

    created_tables = set()
    inserted = 0
    errors = []

    for stmt in statements:
        if not stmt:
            continue

        upper = stmt.upper()

        # Ignora SELECTs de exemplo (só DDL e DML)
        if upper.startswith("SELECT"):
            continue

        try:
            cursor.execute(stmt)
            conn.commit()

            if upper.startswith("CREATE TABLE"):
                # Extrai nome da tabela
                m = re.search(r"CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)", upper)
                if not m:
                    m = re.search(r"CREATE\s+TABLE\s+(\w+)", upper)
                if m:
                    created_tables.add(m.group(1).lower())
            elif upper.startswith("INSERT"):
                inserted += cursor.rowcount

        except sqlite3.OperationalError as e:
            msg = str(e).upper()
            # Ignora silenciosamente se tabela já existe ou coluna duplicada
            if "ALREADY EXISTS" in msg or "DUPLICATE COLUMN" in msg:
                continue
            errors.append(f"[OperationalError] {e}\n  SQL: {stmt[:120]}...")
        except sqlite3.IntegrityError as e:
            # Ignora violações de UNIQUE (dados já inseridos)
            if "UNIQUE" in str(e).upper() or "PRIMARY KEY" in str(e).upper():
                continue
            errors.append(f"[IntegrityError] {e}\n  SQL: {stmt[:120]}...")
        except Exception as e:
            errors.append(f"[{type(e).__name__}] {e}\n  SQL: {stmt[:120]}...")

    # Cria tabela de estoque separadamente (não está no schema.sql original)
    _create_estoque_table(conn)
    created_tables.add("estoque")

    conn.close()

    print("=" * 50)
    print("  AUTOMACAO DE CRIACAO DE TABELAS — Pizza Prime")
    print("=" * 50)
    print(f"  Banco destino : {DB_PATH}")
    print(f"  Schema fonte  : {SCHEMA_PATH}")
    print(f"  Comandos lidos: {len(statements)}")
    print(f"  Tabelas criadas/verificadas: {', '.join(sorted(created_tables)) or 'nenhuma nova'}")
    print(f"  Registros inseridos: {inserted}")
    if errors:
        print(f"  Erros (nao criticos): {len(errors)}")
        for err in errors[:5]:
            print(f"    • {err}")
    else:
        print("  Erros: nenhum")
    print("=" * 50)
    print("  OK — Banco integrado com sucesso!")


if __name__ == "__main__":
    run_setup()
