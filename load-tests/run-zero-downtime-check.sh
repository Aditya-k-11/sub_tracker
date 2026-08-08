#!/bin/bash
mkdir -p load-tests/results
export OUT_FILE="load-tests/results/summary-$(date +%Y%m%d-%H%M%S).json"
k6 run --summary-export=$OUT_FILE load-tests/zero-downtime-check.js
