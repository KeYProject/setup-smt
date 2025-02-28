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

async function download(
  tool: string,
  version: string,
  urls: Tools
): Promise<void> {
  if (!version) {
    return
  }

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
  core.debug(`Platform: ${platform}`)

  const z3Version = core.getInput('z3Version')
  const cvc5Version = core.getInput('cvc5Version')

  const CVC5_TOOL: Tools = {
    linux: {
      url: `https://github.com/cvc5/cvc5/releases/download/cvc5-${cvc5Version}/cvc5-Linux-x86_64-static.zip`,
      format: 'zip',
      binPath: `cvc5-Linux-x86_64-static/bin/`
    },
    windows: {
      url: `https://github.com/cvc5/cvc5/releases/download/cvc5-${cvc5Version}/cvc5-Win64-x86_64-static.zip`,
      format: 'zip',
      binPath: `cvc5-Win64-x86_64-static/bin/`
    },
    macos: {
      url: `https://github.com/cvc5/cvc5/releases/download/cvc5-${cvc5Version}/cvc5-macOS-x86_64-static.zip`,
      format: 'zip',
      binPath: `cvc5-macOS-x86_64-static/bin/`
    }
  }

  const Z3_TOOL: Tools = {
    linux: {
      url: `https://github.com/Z3Prover/z3/releases/download/z3-${z3Version}/z3-${z3Version}-x64-glibc-2.35.zip`,
      format: 'zip',
      binPath: `z3-${z3Version}-x64-glibc-2.35/bin/`
    },
    windows: {
      url: `https://github.com/Z3Prover/z3/releases/download/z3-${z3Version}/z3-${z3Version}-x64-win.zip`,
      format: 'zip',
      binPath: `z3-${z3Version}-x64-win/bin/`
    },
    macos: {
      url: `https://github.com/Z3Prover/z3/releases/download/z3-${z3Version}/z3-${z3Version}-x64-osx-13.7.2.zip`,
      format: 'zip',
      binPath: `z3-${z3Version}-osx/bin/`
    }
  }

  const cvc4Version = core.getInput('cvc4Version')
  const CVC4_TOOL: Tools = {
    linux: {
      url: `https://github.com/CVC4/CVC4/releases/download/${cvc4Version}/cvc4-${cvc4Version}-x86_64-linux-opt`,
      format: 'file',
      binPath: ''
    },
    windows: {
      url: `https://github.com/CVC4/CVC4/releases/download/${cvc4Version}/cvc4-${cvc4Version}-win64-opt.exe`,
      format: 'file',
      binPath: ''
    },
    macos: undefined
  }

  const princessVersion = core.getInput('princessVersion') // 2024-11-08
  const PRINCESS_TOOL: Tools = {
    linux: {
      url: `https://github.com/uuverifiers/princess/releases/download/snapshot-${princessVersion}/princess-bin-${princessVersion}.zip`,
      format: 'zip',
      binPath: `princess-bin-${princessVersion}/bin/`
    },
    windows: {
      url: `https://github.com/uuverifiers/princess/releases/download/snapshot-${princessVersion}/princess-bin-${princessVersion}.zip`,
      format: 'zip',
      binPath: `princess-bin-${princessVersion}/bin/`
    },
    macos: {
      url: `https://github.com/uuverifiers/princess/releases/download/snapshot-${princessVersion}/princess-bin-${princessVersion}.zip`,
      format: 'zip',
      binPath: `princess-bin-${princessVersion}/bin/`
    }
  }

  await download('cvc5', cvc5Version, CVC5_TOOL)
  await download('z3', z3Version, Z3_TOOL)
  await download('cvc4', cvc4Version, CVC4_TOOL)
  await download('princess', princessVersion, PRINCESS_TOOL)
}
