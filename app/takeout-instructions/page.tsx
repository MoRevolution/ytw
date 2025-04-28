"use client"

import Link from "next/link"
import { ArrowLeft, Download, FileText, Folder, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TakeoutInstructionsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">YouTube Wrapped</span>
          </div>
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              How to Export Your YouTube Data
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Follow these steps to get your YouTube watch history data from Google Takeout
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-8">
            {/* Step 1 */}
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Go to Google Takeout</CardTitle>
                <CardDescription>Visit Google Takeout to start the export process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>1. Go to <a href="https://takeout.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">takeout.google.com</a></p>
                  <p>2. Sign in with your Google account if you haven't already</p>
                  <div className="flex justify-center my-4">
                    {/* Replace src with your screenshot for Google Takeout home */}
                    <img src="/images/takeout-step1.png" alt="Google Takeout home page screenshot" className="rounded shadow max-w-full h-auto" style={{maxWidth: 650}} />
                  </div>
                  <div className="text-xs text-muted-foreground text-center">Google Takeout home page (screenshot)</div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Select YouTube Data</CardTitle>
                <CardDescription>Choose which YouTube data you want to export</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>1. Click <b>"Deselect all"</b> to uncheck all services</p>
                  <p>2. Scroll down and find <b>"YouTube and YouTube Music"</b></p>
                  <p>3. Check the box next to it</p>
                  <div className="flex justify-center my-4">
                    {/* Replace src with your screenshot for Deselect all and YouTube selection */}
                    <img src="/images/takeout-step2.png" alt="Deselect all and select YouTube and YouTube Music" className="rounded shadow max-w-full h-auto" style={{maxWidth: 500}} />
                  </div>
                  <div className="text-xs text-muted-foreground text-center">Deselect all, then select YouTube and YouTube Music (screenshot)</div>
                  <p>4. Click <b>"All YouTube data included"</b></p>
                  <p>5. In the popup, make sure only <b>"history"</b> is checked</p>
                  <div className="flex justify-center my-4">
                    {/* Replace src with your screenshot for YouTube data options */}
                    <img src="/images/takeout-step2b.png" alt="YouTube and YouTube Music content options popup" className="rounded shadow max-w-full h-auto" style={{maxWidth: 300}} />
                  </div>
                  <div className="text-xs text-muted-foreground text-center">Select only "history" in the YouTube data popup (screenshot)</div>
                  <p>6. Click <b>"Multiple formats"</b> and scroll down to </p>
                  <div className="flex justify-center my-4">
                    <img src="/images/takeout-step2c.png" alt="YouTube data options popup" className="rounded shadow max-w-full h-auto" style={{maxWidth: 500}} />
                  </div>
                    <div className="text-xs text-muted-foreground text-center">YouTube data options popup (screenshot)</div>
                  <p>7. Click <b>"Next step"</b></p>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Configure Export Settings</CardTitle>
                <CardDescription>Set up how you want to receive your data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>1. Under the "Transfer to:" dropdown, select your "Add to Drive"</p>
                  <p>2. Keep frequency as "Export Once"</p>
                  <p>3. Select your preferred file type (ZIP)</p>
                  <p>4. Choose your preferred file size (the 2GB option is fine)</p>
                  <p>5. Scroll down and click "Create export"</p>
                  {/* Placeholder for export settings screenshot */}
                  <div className="flex justify-center my-4">
                    <img src="/images/takeout-step3.png" alt="YouTube data options popup" className="rounded shadow max-w-full h-auto" style={{maxWidth: 500}} />
                  </div>
                  {/* <div className="flex justify-center my-4">
                    <div className="bg-muted rounded shadow flex items-center justify-center" style={{width: 400, height: 120}}>
                      <img src="/images/takeout-step4.png" alt="Export settings screenshot" className="rounded shadow max-w-full h-auto" style={{maxWidth: 400}} />
                    </div>
                  </div> */}
                </div>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card>
              <CardHeader>
                <CardTitle>Step 4: Wait for Export</CardTitle>
                <CardDescription>Google will prepare your data for download</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>1. Wait for Google to prepare your data (this may take a few minutes to several hours - i worry for you if it takes hours 😭)</p>
                  <p>2. You'll receive an email when your data is ready and you should be good to go!!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mx-auto mt-16 flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <Link href="/">
              <Button size="lg" className="gap-2">
                Return to Home
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
} 