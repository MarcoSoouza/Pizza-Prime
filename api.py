#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
api.py
Backend Flask para gestão de estoque e dados da Pizza Prime.
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from database import (
    fetchall, fetchone, execute,
    listar_sabores, listar_reservas, listar_pedidos
)

app = Flask(__name__)
CORS(app)  # Permite requisições do frontend estático

# ============================================================
# ESTOQUE
# ============================================================

@app.route("/api/estoque", methods=["GET"])
def get_estoque():
    """Retorna todo o estoque com status calculado."""
    rows = fetchall("""
        SELECT id, nome, quantidade_atual, quantidade_minima,
               CASE
                   WHEN quantidade_atual < quantidade_minima THEN 'low'
                   ELSE 'ok'
               END AS status
        FROM estoque
        ORDER BY nome
    """)
    return jsonify(rows)


@app.route("/api/estoque/<int:item_id>/reabastecer", methods=["POST"])
def reabastecer(item_id):
    """Adiciona 10 unidades ao estoque do item."""
    execute(
        "UPDATE estoque SET quantidade_atual = quantidade_atual + 10 WHERE id = ?",
        (item_id,)
    )
    item = fetchone("""
        SELECT id, nome, quantidade_atual, quantidade_minima,
               CASE
                   WHEN quantidade_atual < quantidade_minima THEN 'low'
                   ELSE 'ok'
               END AS status
        FROM estoque WHERE id = ?
    """, (item_id,))
    if item:
        return jsonify({"sucesso": True, "item": item})
    return jsonify({"sucesso": False, "erro": "Item não encontrado"}), 404


@app.route("/api/estoque/<int:item_id>/editar", methods=["POST"])
def editar_estoque(item_id):
    """Atualiza manualmente a quantidade atual e mínima."""
    data = request.get_json() or {}
    atual = data.get("quantidade_atual")
    minima = data.get("quantidade_minima")

    campos = []
    valores = []
    if atual is not None:
        campos.append("quantidade_atual = ?")
        valores.append(atual)
    if minima is not None:
        campos.append("quantidade_minima = ?")
        valores.append(minima)

    if not campos:
        return jsonify({"sucesso": False, "erro": "Nenhum campo para atualizar"}), 400

    valores.append(item_id)
    sql = f"UPDATE estoque SET {', '.join(campos)} WHERE id = ?"
    execute(sql, tuple(valores))

    item = fetchone("""
        SELECT id, nome, quantidade_atual, quantidade_minima,
               CASE
                   WHEN quantidade_atual < quantidade_minima THEN 'low'
                   ELSE 'ok'
               END AS status
        FROM estoque WHERE id = ?
    """, (item_id,))
    return jsonify({"sucesso": True, "item": item})


# ============================================================
# OUTROS ENDPOINTS
# ============================================================

@app.route("/api/sabores", methods=["GET"])
def get_sabores():
    return jsonify(listar_sabores())


@app.route("/api/mesas", methods=["GET"])
def get_mesas():
    return jsonify(listar_mesas())


@app.route("/api/reservas", methods=["GET"])
def get_reservas():
    return jsonify(listar_reservas())


@app.route("/api/reservas/hoje", methods=["GET"])
def get_reservas_hoje():
    from database import listar_reservas_hoje
    return jsonify(listar_reservas_hoje())


@app.route("/api/reservas/estatisticas", methods=["GET"])
def get_estatisticas_reservas():
    from database import estatisticas_reservas
    return jsonify(estatisticas_reservas())


@app.route("/api/reservas/<int:reserva_id>/status", methods=["POST"])
def atualizar_status_reserva_endpoint(reserva_id):
    from database import atualizar_status_reserva
    data = request.get_json() or {}
    status = data.get("status", "").strip().lower()
    if status not in ("confirmada", "pendente", "cancelada"):
        return jsonify({"sucesso": False, "erro": "Status inválido. Use: confirmada, pendente, cancelada"}), 400
    atualizar_status_reserva(reserva_id, status)
    return jsonify({"sucesso": True, "reserva_id": reserva_id, "status": status})


@app.route("/api/reservas", methods=["POST"])
def post_reserva():
    from database import criar_cliente, criar_reserva
    data = request.get_json() or {}

    nome = data.get("nome", "").strip()
    telefone = data.get("telefone", "").strip()
    email = data.get("email", "").strip()
    mesa_id = data.get("mesa_id")
    data_reserva = data.get("data_reserva", "").strip()
    quantidade_pessoas = data.get("quantidade_pessoas")
    observacao = data.get("observacao", "").strip()
    aniversario = 1 if data.get("aniversario") else 0
    promocao = data.get("promo", "").strip()

    if not nome or not telefone or not data_reserva or not mesa_id or not quantidade_pessoas:
        return jsonify({"sucesso": False, "erro": "Campos obrigatórios faltando"}), 400

    try:
        cliente_id = criar_cliente(nome, telefone, email)
        reserva_id = criar_reserva(
            cliente_id=cliente_id,
            mesa_id=int(mesa_id),
            data_reserva=data_reserva,
            quantidade_pessoas=int(quantidade_pessoas),
            observacao=observacao,
            status="pendente",
            aniversario=aniversario,
            promocao=promocao
        )
        return jsonify({"sucesso": True, "reserva_id": reserva_id, "cliente_id": cliente_id})
    except Exception as e:
        return jsonify({"sucesso": False, "erro": str(e)}), 500


@app.route("/api/pedidos", methods=["GET"])
def get_pedidos():
    return jsonify(listar_pedidos())


@app.route("/api/pedidos/<int:pedido_id>/itens", methods=["GET"])
def get_itens_pedido(pedido_id):
    from database import listar_itens_pedido
    return jsonify(listar_itens_pedido(pedido_id))


# ============================================================
# SERVIR ARQUIVOS ESTÁTICOS (HTML, CSS, JS, IMAGENS)
# ============================================================

@app.route("/")
def serve_index():
    return send_from_directory(".", "reserva.html")


@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory(".", filename)


# ============================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
