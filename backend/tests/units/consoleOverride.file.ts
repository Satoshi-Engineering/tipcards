/* eslint-disable no-console */
import consoleOverride from '../../src/consoleOverride'

consoleOverride()

console.debug('Foo', 'Debug')
console.log('Foo', 'Log')
console.info('Foo', 'Info')
console.warn('Foo', 'Warn')
console.error('Foo', 'Error')
console.info({ test: 'Object'}, 'Bar')
