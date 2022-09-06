import path from 'path'
import { spawn } from 'child_process'

describe('Console helper which overides the default console functions', () => {

  it('prepends the current time to console outputs', (done) => {
    const stdoutData = ['Debug', 'Log', 'Info', '{ test: \'Object\' }']
    const stderrData = ['Warn', 'Error']

    let stdoutLines: Array<string> = []
    let stderrLines: Array<string> = []

    const testAppFilePath = path.join(
      __dirname,
      './consoleOverride.file.ts',
    )

    // Run the script
    const app = spawn('npx', ['ts-node', testAppFilePath])

    // Collecting stdout
    app.stdout.on('data', data => {
      stdoutLines = stdoutLines.concat(data.toString().split('\n').filter((v: string) => v.length))
    })

    // Collecting stderr
    app.stderr.on('data', data => {
      stderrLines = stderrLines.concat(data.toString().split('\n').filter((v: string) => v.length))
    })

    // Check output after process is finished
    app.on('close', (code) => {
      expect(code).toBe(0)
      stdoutLines.forEach((v, i) => {
        expect(v).toMatch(new RegExp(/[[0-9\-: ]*] /g))
        expect(v).toContain(stdoutData[i])
      })
      stderrLines.forEach((v, i) => {
        expect(v).toMatch(new RegExp(/[[0-9\-: ]*] /g))
        expect(v).toContain(stderrData[i])
      })
      done()
    })
  }, 25000)
})
