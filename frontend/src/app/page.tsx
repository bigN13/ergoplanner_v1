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
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {config.app.name} AI Suite
          </h1>
          <p className="text-xl text-gray-600 mb-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <Card variant="bordered">
            <Stack spacing="md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">P&ID Drawing</h3>
              <p className="text-gray-600 text-sm">
                Professional P&ID creation with ISA-5.1 and ISO 14617 standard symbols
              </p>
            </Stack>
          </Card>

          <Card variant="bordered">
            <Stack spacing="md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Auto BoQ</h3>
              <p className="text-gray-600 text-sm">
                Automatic Bill of Quantities generation synced with your drawings
              </p>
            </Stack>
          </Card>

          <Card variant="bordered">
            <Stack spacing="md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Cpu className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold">AI Assistant</h3>
              <p className="text-gray-600 text-sm">
                Natural language to P&ID generation and intelligent design validation
              </p>
            </Stack>
          </Card>

          <Card variant="bordered">
            <Stack spacing="md">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold">Collaboration</h3>
              <p className="text-gray-600 text-sm">
                Real-time collaboration with presence indicators and activity tracking
              </p>
            </Stack>
          </Card>
        </div>

        {/* Status Section */}
        <Card variant="elevated" className="mt-8">
          <Stack spacing="md">
            <h2 className="text-2xl font-semibold">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="flex gap-2 mt-1">
                  {config.features.ai && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      AI
                    </span>
                  )}
                  {config.features.collaboration && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      Collaboration
                    </span>
                  )}
                  {config.features.offlineMode && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
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
