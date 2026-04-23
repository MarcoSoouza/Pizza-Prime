#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
database.py
Módulo central de conexão e operações com o banco SQLite.
"""

import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional

DB_NAME = "novo banco pizza.db"


def get_connection() -> sqlite3.Connection:
    """Retorna uma conexão configurada com o banco SQLite."""
    conn = sqlite3.connect(DB_NAME)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.row_factory = sqlite3.Row
    return conn


def execute(sql: str, params: tuple = ()) -> int:
    """Executa um comando SQL e retorna o rowcount."""
    with get_connection() as conn:
        cursor = conn.execute(sql, params)
        conn.commit()
        return cursor.rowcount


def fetchall(sql: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """Executa SELECT e retorna lista de dicionários."""
    with get_connection() as conn:
        cursor = conn.execute(sql, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def fetchone(sql: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
    """Executa SELECT e retorna um único registro ou None."""
    with get_connection() as conn:
        cursor = conn.execute(sql, params)
        row = cursor.fetchone()
        return dict(row) if row else None


# ============================================================
# UTILITÁRIOS DE DOMÍNIO
# ============================================================

def listar_sabores() -> List[Dict[str, Any]]:
    return fetchall("SELECT * FROM sabores ORDER BY nome")


def listar_bebidas() -> List[Dict[str, Any]]:
    return fetchall("SELECT * FROM bebidas ORDER BY nome")


def listar_precos_completo() -> List[Dict[str, Any]]:
    sql = """
        SELECT p.id, s.nome AS sabor, t.nome AS tamanho, p.preco
        FROM precos p
        JOIN sabores s ON p.sabor_id = s.id
        JOIN tamanhos t ON p.tamanho_id = t.id
        ORDER BY s.nome, t.nome
    """
    return fetchall(sql)


def listar_pedidos() -> List[Dict[str, Any]]:
    sql = """
        SELECT
            pe.id,
            c.nome AS cliente,
            sp.nome AS status,
            pe.data_pedido,
            pe.total
        FROM pedidos pe
        JOIN clientes c ON pe.cliente_id = c.id
        JOIN status_pedido sp ON pe.status_id = sp.id
        ORDER BY pe.data_pedido DESC
    """
    return fetchall(sql)


def listar_itens_pedido(pedido_id: int) -> List[Dict[str, Any]]:
    sql = """
        SELECT
            s.nome AS sabor,
            t.nome AS tamanho,
            p.preco,
            ip.quantidade
        FROM itens_pedido ip
        JOIN precos p ON ip.preco_id = p.id
        JOIN sabores s ON p.sabor_id = s.id
        JOIN tamanhos t ON p.tamanho_id = t.id
        WHERE ip.pedido_id = ?
    """
    return fetchall(sql, (pedido_id,))


def listar_reservas() -> List[Dict[str, Any]]:
    sql = """
        SELECT
            r.id,
            c.nome AS cliente,
            m.numero AS mesa,
            m.capacidade,
            r.quantidade_pessoas,
            r.data_reserva,
            r.observacao
        FROM reservas r
        JOIN clientes c ON r.cliente_id = c.id
        JOIN mesas m ON r.mesa_id = m.id
        ORDER BY r.data_reserva DESC
    """
    return fetchall(sql)


def listar_clientes() -> List[Dict[str, Any]]:
    return fetchall("SELECT * FROM clientes ORDER BY nome")


def listar_mesas() -> List[Dict[str, Any]]:
    return fetchall("SELECT * FROM mesas ORDER BY numero")


# ============================================================
# ESTOQUE
# ============================================================

def listar_estoque() -> List[Dict[str, Any]]:
    return fetchall("""
        SELECT id, nome, quantidade_atual, quantidade_minima,
               CASE
                   WHEN quantidade_atual < quantidade_minima THEN 'low'
                   ELSE 'ok'
               END AS status
        FROM estoque
        ORDER BY nome
    """)


def reabastecer_estoque(item_id: int, qtd: int = 10) -> bool:
    execute(
        "UPDATE estoque SET quantidade_atual = quantidade_atual + ? WHERE id = ?",
        (qtd, item_id)
    )
    return True


def atualizar_estoque(item_id: int, atual: int = None, minima: int = None) -> bool:
    campos = []
    valores = []
    if atual is not None:
        campos.append("quantidade_atual = ?")
        valores.append(atual)
    if minima is not None:
        campos.append("quantidade_minima = ?")
        valores.append(minima)
    if not campos:
        return False
    valores.append(item_id)
    sql = f"UPDATE estoque SET {', '.join(campos)} WHERE id = ?"
    execute(sql, tuple(valores))
    return True


if __name__ == "__main__":
    # Quick smoke-test
    print("Conectando ao banco:", DB_NAME)
    print("Sabores cadastrados:", len(listar_sabores()))
    print("Reservas cadastradas:", len(listar_reservas()))
    print("Itens em estoque:", len(listar_estoque()))
    print("OK — módulo database.py funcionando.")
