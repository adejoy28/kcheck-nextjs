import { runMigrations } from './migrate'

async function freshMigrate() {
    console.log('Starting fresh migration...')
    await runMigrations()
    console.log('Fresh migration complete')
}

freshMigrate()
