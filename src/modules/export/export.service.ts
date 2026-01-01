import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Archiver from 'archiver';
import { Project } from '../projects/entities/project.entity';
import { Page } from '../pages/entities/page.entity';
import { Section } from '../sections/entities/section.entity';
import { Component, ComponentType } from '../components/entities/component.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(Project) private readonly projectsRepo: Repository<Project>,
    @InjectRepository(Page) private readonly pagesRepo: Repository<Page>,
    @InjectRepository(Section) private readonly sectionsRepo: Repository<Section>,
    @InjectRepository(Component) private readonly componentsRepo: Repository<Component>,
  ) {}

  async exportProject(slug: string, user: User): Promise<{ buffer: Buffer; filename: string }> {
    // Check if user is verified
    if (!user.isVerified) {
      throw new ForbiddenException('Only verified users can export projects. Please contact an administrator.');
    }

    // Get project with all related data
    const project = await this.projectsRepo.findOne({
      where: { slug, userId: user.id },
    });

    if (!project) {
      throw new NotFoundException(`Project "${slug}" not found or you don't have access`);
    }

    const pages = await this.pagesRepo.find({
      where: { projectId: project.id },
      order: { order: 'ASC' },
    });

    const pagesWithContent = await Promise.all(
      pages.map(async (page) => {
        const sections = await this.sectionsRepo.find({
          where: { pageId: page.id },
          order: { order: 'ASC' },
        });

        const sectionsWithComponents = await Promise.all(
          sections.map(async (section) => {
            const components = await this.componentsRepo.find({
              where: { sectionId: section.id },
              order: { zIndex: 'ASC' },
            });
            return { ...section, components };
          }),
        );

        return { ...page, sections: sectionsWithComponents };
      }),
    );

    // Generate ZIP file and collect into buffer
    const archive = Archiver.default('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    // Collect data chunks
    archive.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Generate package.json
    const packageJson = this.generatePackageJson(project.name);
    archive.append(packageJson, { name: 'package.json' });

    // Generate next.config.js
    const nextConfig = this.generateNextConfig();
    archive.append(nextConfig, { name: 'next.config.js' });

    // Generate tsconfig.json
    const tsConfig = this.generateTsConfig();
    archive.append(tsConfig, { name: 'tsconfig.json' });

    // Generate global styles
    const globalStyles = this.generateGlobalStyles();
    archive.append(globalStyles, { name: 'src/styles/globals.css' });

    // Generate app layout
    const layout = this.generateLayout(project.name);
    archive.append(layout, { name: 'src/app/layout.tsx' });

    // Generate pages
    for (const page of pagesWithContent) {
      const pagePath = page.isHome ? 'src/app/page.tsx' : `src/app${page.path}/page.tsx`;
      const pageContent = this.generatePage(page);
      archive.append(pageContent, { name: pagePath });
    }

    // Generate component files
    archive.append(this.generateSectionComponent(), { name: 'src/components/Section.tsx' });
    archive.append(this.generateTextComponent(), { name: 'src/components/TextComponent.tsx' });
    archive.append(this.generateImageComponent(), { name: 'src/components/ImageComponent.tsx' });
    archive.append(this.generateButtonComponent(), { name: 'src/components/ButtonComponent.tsx' });
    archive.append(this.generateContainerComponent(), { name: 'src/components/ContainerComponent.tsx' });
    archive.append(this.generateLinkComponent(), { name: 'src/components/LinkComponent.tsx' });
    archive.append(this.generateFormComponent(), { name: 'src/components/FormComponent.tsx' });
    archive.append(this.generateComponentRenderer(), { name: 'src/components/ComponentRenderer.tsx' });

    // Generate README
    const readme = this.generateReadme(project.name);
    archive.append(readme, { name: 'README.md' });

    // Wait for archive to complete
    await new Promise<void>((resolve, reject) => {
      archive.on('end', () => resolve());
      archive.on('error', (err) => reject(err));
      archive.finalize();
    });

    return {
      buffer: Buffer.concat(chunks),
      filename: `${project.slug}.zip`,
    };
  }

  private generatePackageJson(projectName: string): string {
    return JSON.stringify({
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
      },
      dependencies: {
        next: '^14.0.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
      devDependencies: {
        '@types/node': '^20',
        '@types/react': '^18',
        '@types/react-dom': '^18',
        typescript: '^5',
      },
    }, null, 2);
  }

  private generateNextConfig(): string {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`;
  }

  private generateTsConfig(): string {
    return JSON.stringify({
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [{ name: 'next' }],
        paths: { '@/*': ['./src/*'] },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    }, null, 2);
  }

  private generateGlobalStyles(): string {
    return `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

.section {
  position: relative;
  width: 100%;
}

.component {
  position: absolute;
}
`;
  }

  private generateLayout(projectName: string): string {
    return `import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: '${projectName}',
  description: 'Generated by MultiWeb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;
  }

  private generatePage(page: { name: string; sections: Array<{ id: string; height: number; styles: Record<string, unknown>; components: Component[] }> }): string {
    const sectionsData = JSON.stringify(page.sections.map(s => ({
      id: s.id,
      height: s.height,
      styles: s.styles || {},
      components: s.components.map(c => ({
        id: c.id,
        type: c.type,
        x: c.x,
        y: c.y,
        width: c.width,
        height: c.height,
        props: c.props || {},
        styles: c.styles || {},
        zIndex: c.zIndex,
      })),
    })));

    return `import Section from '@/components/Section';

const sectionsData = ${sectionsData};

export default function ${page.name.replace(/\s+/g, '')}Page() {
  return (
    <main>
      {sectionsData.map((section) => (
        <Section key={section.id} {...section} />
      ))}
    </main>
  );
}
`;
  }

  private generateSectionComponent(): string {
    return `import ComponentRenderer from './ComponentRenderer';

interface SectionProps {
  id: string;
  height: number;
  styles: Record<string, unknown>;
  components: Array<{
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    props: Record<string, unknown>;
    styles: Record<string, unknown>;
    zIndex: number;
  }>;
}

export default function Section({ height, styles, components }: SectionProps) {
  return (
    <section
      className="section"
      style={{
        height: \`\${height}px\`,
        ...styles as React.CSSProperties,
      }}
    >
      {components.map((component) => (
        <ComponentRenderer key={component.id} {...component} />
      ))}
    </section>
  );
}
`;
  }

  private generateComponentRenderer(): string {
    return `import TextComponent from './TextComponent';
import ImageComponent from './ImageComponent';
import ButtonComponent from './ButtonComponent';
import ContainerComponent from './ContainerComponent';
import LinkComponent from './LinkComponent';
import FormComponent from './FormComponent';

interface ComponentProps {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  props: Record<string, unknown>;
  styles: Record<string, unknown>;
  zIndex: number;
}

export default function ComponentRenderer(props: ComponentProps) {
  const baseStyles: React.CSSProperties = {
    position: 'absolute',
    left: \`\${props.x}px\`,
    top: \`\${props.y}px\`,
    width: \`\${props.width}px\`,
    height: \`\${props.height}px\`,
    zIndex: props.zIndex,
    ...props.styles as React.CSSProperties,
  };

  switch (props.type) {
    case 'text':
      return <TextComponent {...props} baseStyles={baseStyles} />;
    case 'image':
      return <ImageComponent {...props} baseStyles={baseStyles} />;
    case 'button':
      return <ButtonComponent {...props} baseStyles={baseStyles} />;
    case 'container':
      return <ContainerComponent {...props} baseStyles={baseStyles} />;
    case 'link':
      return <LinkComponent {...props} baseStyles={baseStyles} />;
    case 'form':
      return <FormComponent {...props} baseStyles={baseStyles} />;
    default:
      return null;
  }
}
`;
  }

  private generateTextComponent(): string {
    return `interface TextComponentProps {
  props: Record<string, unknown>;
  baseStyles: React.CSSProperties;
}

export default function TextComponent({ props, baseStyles }: TextComponentProps) {
  return (
    <div style={baseStyles}>
      {String(props.content || '')}
    </div>
  );
}
`;
  }

  private generateImageComponent(): string {
    return `/* eslint-disable @next/next/no-img-element */
interface ImageComponentProps {
  props: Record<string, unknown>;
  baseStyles: React.CSSProperties;
}

export default function ImageComponent({ props, baseStyles }: ImageComponentProps) {
  return (
    <img
      src={String(props.src || '')}
      alt={String(props.alt || 'Image')}
      style={{ ...baseStyles, objectFit: 'cover' }}
    />
  );
}
`;
  }

  private generateButtonComponent(): string {
    return `interface ButtonComponentProps {
  props: Record<string, unknown>;
  baseStyles: React.CSSProperties;
}

export default function ButtonComponent({ props, baseStyles }: ButtonComponentProps) {
  return (
    <button
      style={baseStyles}
      onClick={() => props.href && (window.location.href = String(props.href))}
    >
      {String(props.content || 'Click me')}
    </button>
  );
}
`;
  }

  private generateContainerComponent(): string {
    return `interface ContainerComponentProps {
  props: Record<string, unknown>;
  baseStyles: React.CSSProperties;
}

export default function ContainerComponent({ baseStyles }: ContainerComponentProps) {
  return <div style={baseStyles} />;
}
`;
  }

  private generateLinkComponent(): string {
    return `interface LinkComponentProps {
  props: Record<string, unknown>;
  baseStyles: React.CSSProperties;
}

export default function LinkComponent({ props, baseStyles }: LinkComponentProps) {
  return (
    <a href={String(props.href || '#')} style={baseStyles}>
      {String(props.content || 'Link')}
    </a>
  );
}
`;
  }

  private generateFormComponent(): string {
    return `interface FormComponentProps {
  props: Record<string, unknown>;
  baseStyles: React.CSSProperties;
}

export default function FormComponent({ props, baseStyles }: FormComponentProps) {
  const fields = (props.fields as Array<{ name: string; type: string; placeholder?: string }>) || [];

  return (
    <form style={baseStyles} onSubmit={(e) => e.preventDefault()}>
      {fields.map((field, index) => (
        <input
          key={index}
          type={field.type || 'text'}
          name={field.name}
          placeholder={field.placeholder || ''}
          style={{ display: 'block', marginBottom: '8px', width: '100%', padding: '8px' }}
        />
      ))}
      <button type="submit" style={{ padding: '8px 16px' }}>
        {String(props.submitText || 'Submit')}
      </button>
    </form>
  );
}
`;
  }

  private generateReadme(projectName: string): string {
    return `# ${projectName}

This project was generated by **MultiWeb**.

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Deploy

This project is ready to deploy on:
- **Vercel** (recommended)
- **Netlify**
- **Any Node.js hosting**

---

Generated with ❤️ by MultiWeb
`;
  }
}
