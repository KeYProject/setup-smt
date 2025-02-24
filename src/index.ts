import * as tc from '@actions/tool-cache'
import * as core from '@actions/core'
import { env } from 'process'

interface Tools {
  linux: Tool | undefined
  windows: Tool | undefined
  macos: Tool | undefined
}

interface Tool {
  url: string
  format: string
  binPath: string
}

type Platform = 'linux' | 'windows' | 'macos'

// The operating system of the runner executing the job. Possible values are Linux, Windows, or macOS. For example, Windows
const platform: Platform = (env.RUNNER_OS?.toLowerCase() || 'linux') as Platform

async function download(tool: string, version: string, urls: Tools) {
  let toolPath = tc.find(tool, version, platform)

  const info: Tool | undefined = urls[platform]

  if (info === undefined) {
    return
  }

  if (!toolPath) {
    const downloadPath = await tc.downloadTool(info.url)
    let extractedPath: string

    switch (info.format) {
      case 'tar':
        extractedPath = await tc.extractTar(downloadPath)
        break
      case '7z':
        extractedPath = await tc.extract7z(downloadPath)
        break
      case 'xar':
        extractedPath = await tc.extractXar(downloadPath)
        break
      default:
        extractedPath = await tc.extractZip(downloadPath)
    }

    toolPath = await tc.cacheDir(extractedPath, tool, version, platform)
  }

  core.addPath(`${toolPath}/${info.binPath}`)
  core.debug(`${toolPath}/${info.binPath} to PATH`)
}
export async function run(): Promise<void> {
  await download('z3', '4.14.0', {
    linux: {
      url: 'https://github.com/Z3Prover/z3/releases/download/z3-4.14.0/z3-4.14.0-x64-glibc-2.35.zip',
      format: 'zip',
      binPath: 'z3-4.14.0-x64-glibc-2.35/bin/'
    },
    windows: {
      url: 'https://github.com/Z3Prover/z3/releases/download/z3-4.14.0/z3-4.14.0-x64-win.zip',
      format: 'zip',
      binPath: 'z3-4.14.0-x64-win/bin/'
    },
    macos: {
      url: 'https://github.com/Z3Prover/z3/releases/download/z3-4.14.0/z3-4.14.0-x64-osx-13.7.2.zip',
      format: 'zip',
      binPath: 'z3-4.14.0-osx/bin/'
    }
  })

  await download('cvc5', '1.2.1', {
    linux: {
      url: 'https://github.com/cvc5/cvc5/releases/download/cvc5-1.2.1/cvc5-Linux-x86_64-static.zip',
      format: 'zip',
      binPath: 'cvc5-Linux-x86_64-static/bin/'
    },
    windows: {
      url: 'https://github.com/cvc5/cvc5/releases/download/cvc5-1.2.1/cvc5-Win64-x86_64-static.zip',
      format: 'zip',
      binPath: 'cvc5-Win64-x86_64-static/bin/'
    },
    macos: {
      url: 'https://github.com/cvc5/cvc5/releases/download/cvc5-1.2.1/cvc5-macOS-x86_64-static.zip',
      format: 'zip',
      binPath: 'cvc5-macOs-x86_64-static/bin/'
    }
  })
}
