module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-tailwindcss'
  ],
  rules: {
    // if you want to keep standard but manually whitelist at-rules instead:
    // 'at-rule-no-unknown': [ true, {
    //   ignoreAtRules: [
    //     'tailwind', 'apply', 'variants', 'responsive', 'screen', 'layer'
    //   ]
    // }],
  }
}
