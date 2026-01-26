/**
 * Settings API Route
 * GET/PUT settings from/to JSON file
 */

import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json')

// Default settings
const defaultSettings = {
  siteTitle: 'TeamForge - Team Building',
  siteDescription: 'Profesionální teambuilding programy a workshopy',
  contactEmail: 'info@teamforge.cz',
  contactPhone: '+420 123 456 789',
  companyName: 'TeamForge s.r.o.',
  companyAddress: 'Ulice 123, 160 00 Praha 6',
  companyIco: '12345678',
  companyDic: 'CZ12345678',
  companyBankAccount: '123456789/0100',
}

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

async function getSettings() {
  try {
    await ensureDataDir()
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    // Return defaults if file doesn't exist
    return defaultSettings
  }
}

async function saveSettings(settings: typeof defaultSettings) {
  await ensureDataDir()
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8')
}

// GET - Retrieve settings
export async function GET() {
  try {
    const settings = await getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error reading settings:', error)
    return NextResponse.json(
      { error: 'Failed to read settings' },
      { status: 500 }
    )
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Merge with existing settings
    const currentSettings = await getSettings()
    const updatedSettings = {
      ...currentSettings,
      ...body,
    }

    await saveSettings(updatedSettings)

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
    })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}
