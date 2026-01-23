/**
 * Admin Settings Page
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Settings, Bell, Users, DollarSign, Globe } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nastavení</h1>
        <p className="text-gray-600 mt-1">Konfigurace systému PartyPal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2 text-partypal-pink-600" />
              Obecné nastavení
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Název společnosti
              </label>
              <input
                type="text"
                defaultValue="PartyPal"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue="info@partypal.cz"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                defaultValue="+420 123 456 789"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              />
            </div>

            <Button className="w-full">Uložit změny</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-partypal-pink-600" />
              Platby a ceny
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Měna
              </label>
              <select className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none">
                <option value="CZK">CZK - Česká koruna</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sazba DPH (%)
              </label>
              <input
                type="number"
                defaultValue="21"
                min="0"
                max="100"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Záloha (%)
              </label>
              <input
                type="number"
                defaultValue="30"
                min="0"
                max="100"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              />
            </div>

            <Button className="w-full">Uložit změny</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2 text-partypal-pink-600" />
              Notifikace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-partypal-pink-600 rounded focus:ring-partypal-pink-400"
              />
              <span className="text-sm font-medium text-gray-700">
                Email při nové objednávce
              </span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-partypal-pink-600 rounded focus:ring-partypal-pink-400"
              />
              <span className="text-sm font-medium text-gray-700">
                Připomínka nadcházející oslavy
              </span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="w-5 h-5 text-partypal-pink-600 rounded focus:ring-partypal-pink-400"
              />
              <span className="text-sm font-medium text-gray-700">
                Měsíční report
              </span>
            </label>

            <Button className="w-full mt-4">Uložit změny</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-partypal-pink-600" />
              Uživatelé a přístupy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Správa administrátorských účtů a přístupových oprávnění.
            </p>

            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Admin</p>
                  <p className="text-xs text-gray-600">admin@partypal.cz</p>
                </div>
                <span className="text-xs text-gray-500">Super Admin</span>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Spravovat uživatele
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
