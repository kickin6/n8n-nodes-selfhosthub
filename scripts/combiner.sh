#!/bin/bash

# combiner.sh - Generate per-node reports
# Always runs for every node under ./nodes.
# Produces 3 files per node: source, tests, coverage.

OUTPUT_DIR="./"
TESTS_DIR="__tests__/nodes"

mkdir -p "$OUTPUT_DIR"

# Detect node directories under ./nodes
for nodepath in ./nodes/*; do
  if [ -d "$nodepath" ]; then
    nodename=$(basename "$nodepath")
    lc_nodename=$(echo "$nodename" | tr '[:upper:]' '[:lower:]')

    src_file="${OUTPUT_DIR}/output_${lc_nodename}_source.txt"
    test_file="${OUTPUT_DIR}/output_${lc_nodename}_tests.txt"
    cov_file="${OUTPUT_DIR}/output_${lc_nodename}_coverage.txt"

    # --- Source File ---
    echo "# Source code and related files for $nodename" > "$src_file"
    echo "# Note: They include line numbers for reference" >> "$src_file"
    echo "" >> "$src_file"

    # Index (node + docs + credentials)
    find "$nodepath" ./docs/"$nodename" ./credentials \
         -type f \( -name "*.ts" -o -name "*.json" -o -name "*.md" \) 2>/dev/null | sort >> "$src_file"
    echo "" >> "$src_file"

    # Append contents with line numbers
    find "$nodepath" ./docs/"$nodename" ./credentials \
         -type f \( -name "*.ts" -o -name "*.json" -o -name "*.md" \) 2>/dev/null | sort | while read -r file; do
      echo "########" >> "$src_file"
      echo "# FILE: $file" >> "$src_file"
      echo "########" >> "$src_file"
      nl -ba "$file" >> "$src_file"
      echo -e "\n" >> "$src_file"
    done

    # --- Tests File ---
    echo "# Test files for $nodename" > "$test_file"
    echo "# Note: They include line numbers for reference" >> "$test_file"

    # File index
    echo -e "\n## Test File Index" >> "$test_file"
    find "$TESTS_DIR/$nodename" -type f -name "*.ts" 2>/dev/null | sort >> "$test_file"

    # Append test file contents
    find "$TESTS_DIR/$nodename" -type f -name "*.ts" 2>/dev/null | sort | while read -r testfile; do
      echo "" >> "$test_file"
      echo "########" >> "$test_file"
      echo "# TEST FILE: $testfile" >> "$test_file"
      echo "########" >> "$test_file"
      nl -ba "$testfile" >> "$test_file"
      echo -e "\n" >> "$test_file"
    done

    # --- Coverage File ---
    echo "# Jest results + coverage for $nodename" > "$cov_file"

    # Jest results
    echo -e "\n######## JEST RESULTS ########" >> "$cov_file"
    npx jest --no-color --testLocationInResults "__tests__/nodes/$nodename/" \
      >> "$cov_file" 2>&1 || true

    # Jest coverage
    echo -e "\n######## JEST COVERAGE ########" >> "$cov_file"
    npx jest --coverage --silent --no-color \
      --collectCoverageFrom="nodes/$nodename/**/*.ts" \
      "__tests__/nodes/$nodename/" \
      >> "$cov_file" 2>&1 || true
  fi
done
