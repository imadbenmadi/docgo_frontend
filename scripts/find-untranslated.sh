#!/bin/bash

# Find untranslated hardcoded strings in React components
# Looks for common patterns: >Text<, placeholder="...", title="...", etc

echo "🔍 Scanning for untranslated strings in React components..."
echo ""

FOUND=0

# Common UI text patterns to search for
patterns=(
  '>Error<'
  '>Success<'
  '>Loading<'
  '>Submit<'
  '>Cancel<'
  '>Delete<'
  '>Save<'
  '>Edit<'
  '>Add<'
  '>Remove<'
  '>Search<'
  '>Filter<'
  '>Sort<'
  '>No data<'
  '>No results<'
  '>Required<'
  '>Invalid<'
  '>Please<'
  '>Confirm<'
  '>Warning<'
  '>Info<'
  '>Logout<'
  '>Login<'
  '>Back<'
  '>Next<'
  '>Previous<'
  '>Home<'
  '>Dashboard<'
  '>Profile<'
)

echo "Looking for these common patterns:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for pattern in "${patterns[@]}"; do
  matches=$(grep -r "$pattern" src/ 2>/dev/null | grep -v "t(\"" | grep -v "useTranslation")
  if [ ! -z "$matches" ]; then
    echo "📍 Found: $pattern"
    echo "$matches" | head -3 | sed 's/^/   /'
    FOUND=$((FOUND + 1))
    echo ""
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $FOUND -eq 0 ]; then
  echo "✅ No untranslated strings found!"
else
  echo "⚠️  Found $FOUND untranslated string patterns"
  echo ""
  echo "💡 Next step: Add these to src/locales/en/translation.json"
  echo "   Then wrap them with t(\"key\") in components"
fi
