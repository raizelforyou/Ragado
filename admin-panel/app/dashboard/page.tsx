'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { api, Application, ApplicationListResponse } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  LogOut,
  RefreshCw,
  CheckCircle,
  Users,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Shield,
  AlertCircle,
  Hash,
  CheckSquare,
  XSquare,
  ClipboardCheck,
} from 'lucide-react'

interface ExpandedState {
  [key: number]: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedItems, setExpandedItems] = useState<ExpandedState>({})
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  })

  const fetchApplications = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response: ApplicationListResponse = await api.getApplications(
        pagination.page,
        pagination.pageSize
      )
      setApplications(response.applications || [])
      setPagination((prev) => ({
        ...prev,
        total: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / (response.page_size || 10)),
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch applications')
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.pageSize])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications()
    }
  }, [isAuthenticated, fetchApplications])

  const handleApprove = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setApprovingId(id)
    try {
      await api.approveApplication(id)
      fetchApplications()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve application')
    } finally {
      setApprovingId(null)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const toggleExpand = (id: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const getStatusBadge = (app: Application) => {
    if (app.is_approved) {
      return <Badge variant="success">Approved</Badge>
    }
    if (app.is_submitted) {
      return <Badge variant="warning">Pending Review</Badge>
    }
    return <Badge variant="secondary">Draft</Badge>
  }

  const parseClassesOfBusiness = (classes: string): string[] => {
    try {
      return JSON.parse(classes)
    } catch {
      return classes ? [classes] : []
    }
  }

  const stats = {
    total: pagination.total,
    approved: applications.filter((a) => a.is_approved).length,
    pending: applications.filter((a) => a.is_submitted && !a.is_approved).length,
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">Ragado Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.name} ({user?.email})
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Broker Applications</CardTitle>
                <CardDescription>
                  Click on an application to view full details
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchApplications}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No applications found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="border rounded-lg overflow-hidden bg-background hover:shadow-md transition-shadow"
                  >
                    {/* Basic Info - Always Visible */}
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => toggleExpand(app.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold truncate">
                                {app.legal_entity_name || app.trading_name}
                              </h3>
                              {getStatusBadge(app)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {app.email}
                              </span>
                              <span className="hidden sm:flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                FRN: {app.frn}
                              </span>
                              <span className="hidden md:flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                {app.company_number}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          {!app.is_approved && app.is_submitted && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={(e) => handleApprove(app.id, e)}
                              disabled={approvingId === app.id}
                            >
                              {approvingId === app.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                          )}
                          <div className="text-muted-foreground">
                            {expandedItems[app.id] ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedItems[app.id] && (
                      <div className="border-t bg-muted/30 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Firm Details */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              Firm Details
                            </h4>
                            <div className="bg-background rounded-lg p-4 space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs text-muted-foreground">Legal Entity Name</div>
                                  <div className="text-sm font-medium">{app.legal_entity_name}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground">Trading Name</div>
                                  <div className="text-sm font-medium">{app.trading_name}</div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs text-muted-foreground">Company Number</div>
                                  <div className="text-sm font-medium font-mono">{app.company_number}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground">FCA Reference Number</div>
                                  <div className="text-sm font-medium font-mono">{app.frn}</div>
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Registered Address</div>
                                <div className="text-sm">{app.registered_address || '-'}</div>
                              </div>
                            </div>
                          </div>

                          {/* Compliance Officer */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Compliance Officer
                            </h4>
                            <div className="bg-background rounded-lg p-4 space-y-3">
                              <div>
                                <div className="text-xs text-muted-foreground">Full Name</div>
                                <div className="text-sm font-medium">{app.full_name}</div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs text-muted-foreground">Email</div>
                                  <div className="text-sm">{app.email}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground">Telephone</div>
                                  <div className="text-sm">{app.telephone}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Regulatory Details */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Regulatory Details
                            </h4>
                            <div className="bg-background rounded-lg p-4 space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs text-muted-foreground">Firm Status</div>
                                  <div className="text-sm font-medium capitalize">
                                    {app.firm_status?.replace(/-/g, ' ') || '-'}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground">Handles Client Money</div>
                                  <div className="text-sm font-medium">
                                    {app.handle_client_money ? (
                                      <span className="text-green-600 flex items-center gap-1">
                                        <CheckSquare className="h-4 w-4" /> Yes
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground flex items-center gap-1">
                                        <XSquare className="h-4 w-4" /> No
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Estimated GWP</div>
                                <div className="text-sm font-medium">{app.estimated_gwp || '-'}</div>
                              </div>
                            </div>
                          </div>

                          {/* Classes of Business */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                              <Briefcase className="h-4 w-4" />
                              Classes of Business
                            </h4>
                            <div className="bg-background rounded-lg p-4">
                              <div className="flex flex-wrap gap-2">
                                {parseClassesOfBusiness(app.classes_of_business).map((cls, idx) => (
                                  <Badge key={idx} variant="secondary">
                                    {cls}
                                  </Badge>
                                ))}
                                {parseClassesOfBusiness(app.classes_of_business).length === 0 && (
                                  <span className="text-sm text-muted-foreground">None selected</span>
                                )}
                              </div>
                              {app.additional_info && (
                                <div className="mt-3 pt-3 border-t">
                                  <div className="text-xs text-muted-foreground">Additional Information</div>
                                  <div className="text-sm mt-1">{app.additional_info}</div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Confirmations */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                              <ClipboardCheck className="h-4 w-4" />
                              Confirmations
                            </h4>
                            <div className="bg-background rounded-lg p-4">
                              {app.confirmations?.items && app.confirmations.items.length > 0 ? (
                                <ul className="space-y-2">
                                  {app.confirmations.items.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-sm text-muted-foreground">No confirmations provided</span>
                              )}
                            </div>
                          </div>

                          {/* Consents */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                              <CheckSquare className="h-4 w-4" />
                              Consents
                            </h4>
                            <div className="bg-background rounded-lg p-4 space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                {app.consent?.fca_register_check ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XSquare className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span>FCA Register Check Consent</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                {app.consent?.accurate_information ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XSquare className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span>Accurate Information Declaration</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                {app.consent?.material_change ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XSquare className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span>Material Change Notification Agreement</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                {app.consent?.preliminary_access ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XSquare className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span>Preliminary Access Terms Accepted</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer with metadata */}
                        <div className="mt-6 pt-4 border-t flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
                          <div className="flex flex-wrap items-center gap-4">
                            <span>Application ID: {app.id}</span>
                            <span>Entity ID: {app.entity_id}</span>
                            {app.risk_score !== null && (
                              <span>Risk Score: {app.risk_score}</span>
                            )}
                            {app.is_evaluated && (
                              <Badge variant="outline" className="text-xs">Evaluated</Badge>
                            )}
                          </div>
                          <div>
                            Created: {new Date(app.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Pagination */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {applications.length} of {pagination.total} applications
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
