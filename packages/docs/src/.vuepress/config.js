const path = require('path');

module.exports = {
  title: 'Moleculer Boilerplate for Typescript',
  description:
    'A Comprehensive Boilerplate for NodeJS micro-services project with `moleculerjs`.',

  markdown: {
    extendMarkdown: md => {
      md.use(require('markdown-it-task-lists'));
    }
  },

  themeConfig: {
    // algolia: {
    //   apiKey: 'ALGOLIA_API_KEY',
    //   indexName: 'moleculerjs-boilerplate-ts',
    // },
    sidebarDepth: 5,
    sidebar: {
      '/dev/': [
        {
          title: 'Setup Environments',
          collapsable: false,
          children: ['prerequisite', 'source-code', 'unit-test']
        }
      ],
      '/biz/': [
        {
          title: 'Business',
          collapsable: false,
          children: ['']
        }
      ]
    },
    nav: [
      { text: '🏢 Home', link: '/' },
      { text: '🛠 Development', link: '/dev/' },
      { text: '💼 Business', link: '/biz/' },
      {
        text: '💡 Stage',
        items: [
          { text: 'Development', link: 'https://dev.ltv.vn' },
          { text: 'Nightly', link: 'https://nightly.ltv.vn' },
          { text: 'Staging', link: 'https://staging.ltv.vn' },
          { text: 'Production', link: 'https://prod.ltv.vn' }
        ]
      },
      { text: '🚀 Changelog 🚀', link: '/changelog/' }
    ]
  }
};
