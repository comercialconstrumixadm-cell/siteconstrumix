@echo off
REM Liga o servidor do Gestao + Orcamento Construmix.
REM Pensado pra rodar sozinho quando o Windows liga (ver README.md, secao
REM "Ligar o servidor sozinho com o Windows") - por isso entra na pasta
REM internal-app relativa a este script (funciona em qualquer computador,
REM nao depende do caminho exato onde a pasta foi colocada).
cd /d "%~dp0.."
call npm run start
