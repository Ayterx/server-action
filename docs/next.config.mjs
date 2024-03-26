import withNextra from 'nextra'

/** @type {import('next').NextConfig} */
const nextConfig = {}

export default withNextra({ theme: 'nextra-theme-docs', themeConfig: './theme.config.tsx' })(
  nextConfig
)
