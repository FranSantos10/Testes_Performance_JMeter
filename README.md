# Relatório de Teste de Performance - BlazeDemo

## Resumo Executivo
- Teste executado com 100 usuários simulados (80% navegação, 20% reserva completa).
- Objetivo: avaliar tempos de resposta, throughput e estabilidade.
- Tempo médio de resposta das páginas principais: 2.5 segundos.
- Taxa de erro: 0,5% (falhas ocasionais em seleção de voo).
- Gargalos identificados no passo de confirmação de compra.

## Metodologia
- Ferramenta: Apache JMeter 5.4
- Cenários: Navegação (80%), Reserva Completa (20%)
- Duração do teste: 10 minutos
- Modelo de carga: ramp-up gradual de 60 segundos


