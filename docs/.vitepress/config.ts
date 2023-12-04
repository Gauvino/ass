import { defineConfig } from 'vitepress';

const LOGO = 'https://i.tycrek.dev/ass';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',
  title: "ass docs",
  description: "Documentation for ass, a ShareX server",
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['meta', { property: 'og:image', content: LOGO }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'twitter:domain', content: 'ass.tycrek.dev' }],
    ['meta', { property: 'twitter:image', content: LOGO }],
    ['link', { rel: 'icon', href: LOGO }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: LOGO,

    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Install', items: [
          { text: 'Docker', link: '/install/docker' },
          { text: 'Local', link: '/install/local' }
        ]
      },
      { text: 'Configure', link: '/configure/' }
    ],

    sidebar: [
      {
        text: 'Install',
        link: '/install/',
        items: [
          { text: 'Docker', link: '/install/docker' },
          { text: 'Local', link: '/install/local' }
        ]
      },
      {
        text: 'Configure',
        link: '/configure/',
        items: [
          {
            text: 'SQL',
            link: '/configure/sql',
            items: [
              {
                text: 'MySQL',
                link: '/configure/sql/mysql'
              },
              {
                text: 'PostgreSQL',
                link: '/configure/sql/postgresql'
              }
            ]
          }
        ]
      },
      {
        text: 'Customize',
        link: '/customize/',
        items: [
          { text: 'Colors', link: '/customize/colors' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/tycrek/ass/' },
      { icon: 'discord', link: 'https://discord.gg/wGZYt5fasY' }
    ]
  }
})
