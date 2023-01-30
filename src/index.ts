import { ESLint } from 'eslint';
import glob from 'fast-glob';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { format as prettierFormat, resolveConfig as prettierResolveConfig } from 'prettier';
import sortPackageJson from 'sort-package-json';

export interface LintActionOptions {
  /** Enable ESLint fix, Prettier and sort-package-json */
  fix?: boolean;
  /** Current working directory */
  cwd?: string;
}

export async function lint({ fix, cwd = process.cwd() }: LintActionOptions) {
  const packageJsonPath = join(cwd, 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

  if (fix) {
    // Format source code with Prettier
    const files = await glob('src/**/*.{js,jsx,ts,tsx}');
    await Promise.all(
      files.map(async (filePath: string) => {
        const text = await readFile(filePath, 'utf8');
        const options = await prettierResolveConfig(filePath);
        const formatted = prettierFormat(text, {
          ...options,
          filepath: filePath,
        });
        if (formatted !== text) {
          await writeFile(filePath, formatted, 'utf8');
          console.log(`Formatted: ${filePath}`);
        }
      })
    );
    // Format package.json
    const options = await prettierResolveConfig(packageJsonPath);
    const formattedPackageJson = prettierFormat(JSON.stringify(sortPackageJson(packageJson)), {
      ...options,
      filepath: packageJsonPath,
    });
    await writeFile(packageJsonPath, formattedPackageJson, 'utf-8');
  }

  // Create ESLint instance and load configuration
  const eslint = new ESLint({
    fix,
    baseConfig: packageJson.eslintConfig,
  });

  // Lint files
  const results = await eslint.lintFiles('src/**/*.{js,jsx,ts,tsx}');

  // Fix lint issues and save changes, if needed
  if (fix) {
    await ESLint.outputFixes(results);
  }

  // Format results and output to console
  const formatter = await eslint.loadFormatter('stylish');
  const resultText = await formatter.format(results);
  console.log(resultText);

  if (ESLint.getErrorResults(results).length > 0) {
    process.exitCode = 1;
  }
}
