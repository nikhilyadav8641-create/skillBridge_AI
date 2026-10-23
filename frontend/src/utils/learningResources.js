
const resources = [
  {
    keywords: ['react', 'frontend', 'web development', 'html', 'css', 'javascript'],
    items: [
      {
        name: 'MDN Web Docs',
        url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development',
        description: 'Official web development guides',
      },
      {
        name: 'freeCodeCamp',
        url: 'https://www.freecodecamp.org/learn/',
        description: 'Free coding lessons and projects',
      },
    ],
  },
  {
    keywords: ['python', 'machine learning', 'data science', 'artificial intelligence', 'ai'],
    items: [
      {
        name: 'freeCodeCamp',
        url: 'https://www.freecodecamp.org/learn/',
        description: 'Free courses and practical exercises',
      },
      {
        name: 'Python Documentation',
        url: 'https://docs.python.org/3/tutorial/',
        description: 'Official Python tutorial',
      },
    ],
  },
  {
    keywords: ['sql', 'mysql', 'database', 'relational database'],
    items: [
      {
        name: 'MySQL Documentation',
        url: 'https://dev.mysql.com/doc/',
        description: 'Official MySQL guides',
      },
      {
        name: 'freeCodeCamp Databases',
        url: 'https://www.freecodecamp.org/learn/relational-databases/',
        description: 'SQL and database practice',
      },
    ],
  },
  {
    keywords: ['java', 'spring boot', 'backend', 'api'],
    items: [
      {
        name: 'Dev.java',
        url: 'https://dev.java/learn/',
        description: 'Official Java learning resources',
      },
      {
        name: 'Spring Guides',
        url: 'https://spring.io/guides',
        description: 'Official Spring tutorials',
      },
    ],
  },
  {
    keywords: ['git', 'github', 'version control'],
    items: [
      {
        name: 'GitHub Skills',
        url: 'https://skills.github.com/',
        description: 'Hands-on GitHub lessons',
      },
      {
        name: 'Git Documentation',
        url: 'https://git-scm.com/doc',
        description: 'Official Git reference',
      },
    ],
  },
]

export function getLearningResources(title = '', description = '') {
  const text = `${title} ${description}`.toLowerCase()

  const matched = resources.filter((resource) =>
    resource.keywords.some((keyword) => text.includes(keyword))
  )

  const selectedItems = matched.flatMap((resource) => resource.items)

  return [
    ...selectedItems,
    {
      name: 'YouTube Tutorials',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${title} ${description} tutorial for beginners`
      )}`,
      description: 'Watch video tutorials related to this task',
    },
  ].filter(
    (resource, index, array) =>
      array.findIndex((item) => item.url === resource.url) === index
  )
}
