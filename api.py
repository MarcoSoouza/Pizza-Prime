#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
api.py
Backend Flask para gestão de estoque e dados da Pizza Prime.
"""

from flask import Flask, jsonify, request
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
# OUTROS ENDPOINTS (prontos para uso futuro)
# ============================================================

@app.route("/api/sabores", methods=["GET"])
def get_sabores():
    return jsonify(listar_sabores())


@app.route("/api/reservas", methods=["GET"])
def get_reservas():
    return jsonify(listar_reservas())


@app.route("/api/pedidos", methods=["GET"])
def get_pedidos():
    return jsonify(listar_pedidos())


@app.route("/api/pedidos/<int:pedido_id>/itens", methods=["GET"])
def get_itens_pedido(pedido_id):
    from database import listar_itens_pedido
    return jsonify(listar_itens_pedido(pedido_id))


# ============================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
