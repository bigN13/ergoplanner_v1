"use client";

import { FileText, Layers, Users, Cpu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container, Card, Stack } from "@/components/ui/layout";
import { config } from "@/lib/config";

export default function Home(): React.ReactElement {
  return (
    <Container maxWidth="xl" className="py-12">
      <Stack spacing="xl">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="mb-4 text-5xl font-bold text-gray-900">{config.app.name} AI Suite</h1>
          <p className="mb-8 text-xl text-gray-600">
            Intelligent P&ID Management System for Engineering Excellence
          </p>
          <Stack direction="horizontal" spacing="md" justify="center">
            <Button
              size="lg"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                window.location.href = "/drawings/new";
              }}
            >
              Create New Drawing
            </Button>
          </Stack>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card variant="bordered">
            <Stack spacing="md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Layers className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">P&ID Drawing</h3>
              <p className="text-sm text-gray-600">
                Professional P&ID creation with ISA-5.1 and ISO 14617 standard symbols
              </p>
            </Stack>
          </Card>

          <Card variant="bordered">
            <Stack spacing="md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Auto BoQ</h3>
              <p className="text-sm text-gray-600">
                Automatic Bill of Quantities generation synced with your drawings
              </p>
            </Stack>
          </Card>

          <Card variant="bordered">
            <Stack spacing="md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Cpu className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold">AI Assistant</h3>
              <p className="text-sm text-gray-600">
                Natural language to P&ID generation and intelligent design validation
              </p>
            </Stack>
          </Card>

          <Card variant="bordered">
            <Stack spacing="md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold">Collaboration</h3>
              <p className="text-sm text-gray-600">
                Real-time collaboration with presence indicators and activity tracking
              </p>
            </Stack>
          </Card>
        </div>

        {/* Status Section */}
        <Card variant="elevated" className="mt-8">
          <Stack spacing="md">
            <h2 className="text-2xl font-semibold">System Status</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-gray-600">Version</p>
                <p className="font-medium">{config.app.version}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">API Status</p>
                <p className="font-medium text-green-600">Connected</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Features</p>
                <div className="mt-1 flex gap-2">
                  {config.features.ai && (
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">AI</span>
                  )}
                  {config.features.collaboration && (
                    <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                      Collaboration
                    </span>
                  )}
                  {config.features.offlineMode && (
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      Offline
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
