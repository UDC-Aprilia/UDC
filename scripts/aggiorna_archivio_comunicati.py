#!/usr/bin/env python3
"""Verifica catalogo comunicati; non aggiunge mai automaticamente file pubblici."""
from valida_pubblicazione import validate
if __name__ == '__main__':
    raise SystemExit(validate())
