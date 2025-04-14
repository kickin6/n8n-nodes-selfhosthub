#!/bin/bash

# Script to run tests for the SelfHostHub n8n node package

# Process arguments
coverage=false
watch=false

# Process command line arguments
for arg in "$@"
do
    case $arg in
        --coverage|-c)
        coverage=true
        shift
        ;;
        --watch|-w)
        watch=true
        shift
        ;;
        *)
        # Unknown option
        ;;
    esac
done

echo "Running tests for SelfHostHub n8n node package..."

if [ "$coverage" = true ] && [ "$watch" = true ]; then
    npx jest --coverage --watch
elif [ "$coverage" = true ]; then
    npx jest --coverage
elif [ "$watch" = true ]; then
    npx jest --watch
else
    npx jest
fi

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo "All tests passed successfully!"
else
    echo "Some tests failed. Please check the output above for details."
fi

exit $exit_code
