'use client'

import { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Bell,
  CreditCard,
  Users,
  Shield,
  Palette,
  Globe,
  Save,
  Camera,
  Key,
  CheckCircle
} from 'lucide-react'

type SettingsTab = 'profile' | 'notifications' | 'billing' | 'team' | 'security'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex space-x-1 overflow-x-auto">
          <TabButton
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
            icon={<User className="w-5 h-5" />}
            label="Profile"
          />
          <TabButton
            active={activeTab === 'notifications'}
            onClick={() => setActiveTab('notifications')}
            icon={<Bell className="w-5 h-5" />}
            label="Notifications"
          />
          <TabButton
            active={activeTab === 'billing'}
            onClick={() => setActiveTab('billing')}
            icon={<CreditCard className="w-5 h-5" />}
            label="Billing"
          />
          <TabButton
            active={activeTab === 'team'}
            onClick={() => setActiveTab('team')}
            icon={<Users className="w-5 h-5" />}
            label="Team"
          />
          <TabButton
            active={activeTab === 'security'}
            onClick={() => setActiveTab('security')}
            icon={<Shield className="w-5 h-5" />}
            label="Security"
          />
        </div>
      </div>

      {/* Save Success Message */}
      {saved && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center space-x-3 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <p className="font-semibold">Settings saved successfully!</p>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

            {/* Profile Photo */}
            <div className="flex items-start space-x-6 mb-6 pb-6 border-b border-gray-100">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-accent-500 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                  JD
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Profile Photo</h3>
                <p className="text-sm text-gray-600 mb-3">Update your profile photo</p>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                    Upload New
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  First Name
                </label>
                <input type="text" defaultValue="John" className="input" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <input type="text" defaultValue="Doe" className="input" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address
                </label>
                <input type="email" defaultValue="john.doe@eventpro.com" className="input" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </label>
                <input type="tel" defaultValue="+1 234 567 8900" className="input" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Company
                </label>
                <input type="text" defaultValue="EventPro Agency" className="input" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Title
                </label>
                <input type="text" defaultValue="Event Manager" className="input" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Address
                </label>
                <input type="text" defaultValue="123 Main Street, New York, NY 10001" className="input" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  defaultValue="Professional event manager with 10+ years of experience."
                  className="input resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Preferences</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Timezone
                </label>
                <select className="input">
                  <option>Eastern Time (ET)</option>
                  <option>Central Time (CT)</option>
                  <option>Mountain Time (MT)</option>
                  <option>Pacific Time (PT)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Palette className="w-4 h-4 inline mr-1" />
                  Theme
                </label>
                <select className="input">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>Auto</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} className="btn-primary inline-flex items-center">
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Email Notifications</h2>
            <div className="space-y-4">
              <NotificationToggle
                label="Event Reminders"
                description="Get reminded about upcoming events"
                defaultChecked={true}
              />
              <NotificationToggle
                label="Booking Confirmations"
                description="Receive confirmation when bookings are made"
                defaultChecked={true}
              />
              <NotificationToggle
                label="Payment Updates"
                description="Get notified about payment status changes"
                defaultChecked={true}
              />
              <NotificationToggle
                label="Marketing Emails"
                description="Receive newsletters and promotional content"
                defaultChecked={false}
              />
              <NotificationToggle
                label="Weekly Reports"
                description="Get weekly summary of your events and activities"
                defaultChecked={true}
              />
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Push Notifications</h2>
            <div className="space-y-4">
              <NotificationToggle
                label="Event Updates"
                description="Real-time updates about your events"
                defaultChecked={true}
              />
              <NotificationToggle
                label="Messages"
                description="Notifications for new messages"
                defaultChecked={true}
              />
              <NotificationToggle
                label="Team Activity"
                description="Updates from your team members"
                defaultChecked={false}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} className="btn-primary inline-flex items-center">
              <Save className="w-5 h-5 mr-2" />
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Current Plan</h2>
              <span className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold">
                Pro Plan
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6 pb-6 border-b border-gray-100">
              <div>
                <p className="text-sm text-gray-600 mb-1">Monthly Cost</p>
                <p className="text-2xl font-bold text-gray-900">$99</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Next Billing Date</p>
                <p className="text-2xl font-bold text-gray-900">Feb 15</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Unlimited events</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>AI-powered timeline generation</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Priority support</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Advanced analytics</span>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                Upgrade Plan
              </button>
              <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                Cancel Subscription
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-8 bg-gradient-to-r from-primary-600 to-accent-500 rounded flex items-center justify-center text-white font-semibold text-xs">
                  VISA
                </div>
                <div>
                  <p className="font-semibold text-gray-900">•••• •••• •••• 4242</p>
                  <p className="text-sm text-gray-600">Expires 12/25</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Edit
              </button>
            </div>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              Add Payment Method
            </button>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Billing History</h2>
            <div className="space-y-3">
              <BillingRow date="Jan 15, 2024" amount="$99.00" status="Paid" />
              <BillingRow date="Dec 15, 2023" amount="$99.00" status="Paid" />
              <BillingRow date="Nov 15, 2023" amount="$99.00" status="Paid" />
            </div>
          </div>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Team Members</h2>
              <button className="btn-primary inline-flex items-center text-sm">
                <Users className="w-4 h-4 mr-2" />
                Invite Member
              </button>
            </div>

            <div className="space-y-4">
              <TeamMemberRow
                name="John Doe"
                email="john.doe@eventpro.com"
                role="Owner"
                avatar="JD"
              />
              <TeamMemberRow
                name="Sarah Johnson"
                email="sarah@eventpro.com"
                role="Admin"
                avatar="SJ"
              />
              <TeamMemberRow
                name="Mike Chen"
                email="mike@eventpro.com"
                role="Member"
                avatar="MC"
              />
              <TeamMemberRow
                name="Emily Rodriguez"
                email="emily@eventpro.com"
                role="Member"
                avatar="ER"
              />
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Change Password</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Key className="w-4 h-4 inline mr-1" />
                  Current Password
                </label>
                <input type="password" className="input" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input type="password" className="input" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input type="password" className="input" />
              </div>
              <button className="btn-primary">
                Update Password
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Two-Factor Authentication</h2>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">2FA Enabled</p>
                <p className="text-sm text-gray-600 mb-4">Your account is protected with two-factor authentication</p>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  Manage 2FA
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Active Sessions</h2>
            <div className="space-y-4">
              <SessionRow
                device="Chrome on MacOS"
                location="New York, USA"
                current={true}
              />
              <SessionRow
                device="Safari on iPhone"
                location="New York, USA"
                current={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
        active
          ? 'bg-primary-600 text-white'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function NotificationToggle({
  label,
  description,
  defaultChecked
}: {
  label: string
  description: string
  defaultChecked: boolean
}) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100">
      <div>
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-primary-600' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-6' : ''
          }`}
        />
      </button>
    </div>
  )
}

function BillingRow({
  date,
  amount,
  status
}: {
  date: string
  amount: string
  status: string
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{date}</p>
          <p className="text-sm text-gray-600">Pro Plan</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <p className="font-semibold text-gray-900">{amount}</p>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
          {status}
        </span>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Download
        </button>
      </div>
    </div>
  )
}

function TeamMemberRow({
  name,
  email,
  role,
  avatar
}: {
  name: string
  email: string
  role: string
  avatar: string
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold">
          {avatar}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-600">{email}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
          {role}
        </span>
        {role !== 'Owner' && (
          <button className="text-sm text-gray-600 hover:text-gray-800">
            Remove
          </button>
        )}
      </div>
    </div>
  )
}

function SessionRow({
  device,
  location,
  current
}: {
  device: string
  location: string
  current: boolean
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <p className="font-semibold text-gray-900">{device}</p>
        <p className="text-sm text-gray-600">{location}</p>
      </div>
      <div className="flex items-center space-x-3">
        {current && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            Current
          </span>
        )}
        {!current && (
          <button className="text-sm text-red-600 hover:text-red-700 font-medium">
            Revoke
          </button>
        )}
      </div>
    </div>
  )
}
