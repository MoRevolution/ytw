"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Download, ExternalLink, FileArchive, Play, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

// Clickable image component with lightbox
function ClickableImage({ src, alt, caption, maxWidth }: { src: string; alt: string; caption?: string; maxWidth?: string }) {
  const [isOpen, setIsOpen] = useState(false)

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <>
      <div className="mt-6" style={maxWidth ? { maxWidth, margin: '1.5rem auto 0' } : undefined}>
        <div className="rounded-xl border shadow-sm overflow-hidden bg-muted/30">
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity" 
            onClick={() => setIsOpen(true)}
          />
        </div>
        {caption && <p className="text-xs text-muted-foreground text-center mt-2">{caption}</p>}
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-8 w-8" />
          </button>
          <img 
            src={src} 
            alt={alt} 
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}

// Two images side by side with lightbox
function ClickableImageGrid({ images }: { images: { src: string; alt: string; caption?: string }[] }) {
  const [openImage, setOpenImage] = useState<string | null>(null)

  // Handle escape key
  useEffect(() => {
    if (!openImage) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenImage(null)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [openImage])

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {images.map((img) => (
          <div key={img.src} className="flex flex-col">
            <div className="rounded-xl border shadow-sm overflow-hidden bg-muted/30 flex-1 flex items-center">
              <img 
                src={img.src} 
                alt={img.alt} 
                className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity" 
                onClick={() => setOpenImage(img.src)}
              />
            </div>
            {img.caption && <p className="text-xs text-muted-foreground text-center mt-2">{img.caption}</p>}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {openImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpenImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            onClick={() => setOpenImage(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <img 
            src={openImage} 
            alt="Enlarged view" 
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}

export default function TakeoutInstructionsPage() {
  const steps = [
    {
      number: 1,
      title: "Go to Google Takeout",
      description: "Visit Google Takeout to start exporting your data",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Head over to Google Takeout and sign in with your Google account.
          </p>
          <a 
            href="https://takeout.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            Open Google Takeout <ExternalLink className="h-4 w-4" />
          </a>
          <ClickableImage 
            src="/images/takeout-step1.png" 
            alt="Google Takeout home page" 
            caption="Google Takeout home page — click to enlarge"
          />
        </div>
      )
    },
    {
      number: 2,
      title: "Select YouTube Only",
      description: "Deselect everything except YouTube data",
      content: (
        <div className="space-y-4">
          <ol className="space-y-2 text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">1</span>
              <span>Click <strong className="text-foreground">&quot;Deselect all&quot;</strong> at the top</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">2</span>
              <span>Scroll down and find <strong className="text-foreground">&quot;YouTube and YouTube Music&quot;</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">3</span>
              <span>Check the box next to it</span>
            </li>
          </ol>
          <ClickableImage 
            src="/images/takeout-step2.png" 
            alt="Select YouTube and YouTube Music" 
            caption="Deselect all, then select YouTube — click to enlarge"
          />
        </div>
      )
    },
    {
      number: 3,
      title: "Select History Only",
      description: "We only need your watch history, nothing else",
      content: (
        <div className="space-y-4">
          <ol className="space-y-2 text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">1</span>
              <span>Click <strong className="text-foreground">&quot;All YouTube data included&quot;</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">2</span>
              <span>Uncheck everything except <strong className="text-foreground">&quot;history&quot;</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">3</span>
              <span>Click <strong className="text-foreground">&quot;OK&quot;</strong></span>
            </li>
          </ol>
          <ClickableImageGrid 
            images={[
              { src: "/images/takeout-step2b.png", alt: "YouTube data options popup", caption: "Select only history" },
              { src: "/images/takeout-step2c.png", alt: "Multiple formats option", caption: "Format options" }
            ]}
          />
        </div>
      )
    },
    {
      number: 4,
      title: "Configure Export Settings",
      description: "Set up how you want to receive your data",
      content: (
        <div className="space-y-4">
          <ol className="space-y-2 text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">1</span>
              <span>Click <strong className="text-foreground">&quot;Next step&quot;</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">2</span>
              <span>Select <strong className="text-foreground">&quot;Add to Drive&quot;</strong> as destination</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">3</span>
              <span>Keep frequency as <strong className="text-foreground">&quot;Export once&quot;</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">4</span>
              <span>Select <strong className="text-foreground">.zip</strong> and <strong className="text-foreground">2GB</strong> size</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">5</span>
              <span>Click <strong className="text-foreground">&quot;Create export&quot;</strong></span>
            </li>
          </ol>
          <ClickableImage 
            src="/images/takeout-step3.png" 
            alt="Export settings" 
            caption="Export settings — click to enlarge"
            maxWidth="480px"
          />
        </div>
      )
    },
    {
      number: 5,
      title: "Wait & You're Done!",
      description: "Google will email you when it's ready",
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 border">
            <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Processing Time</p>
              <p className="text-sm text-muted-foreground">
                Usually a few minutes, but can take up to a few hours for heavy users. 
                You&apos;ll get an email when ready!
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-600 dark:text-green-400">That&apos;s it!</p>
              <p className="text-sm text-muted-foreground">
                Once exported, sign in here and we&apos;ll automatically find it in your Drive.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Play className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
              </div>
              <span className="text-xl font-bold">YouTube Wrapped</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-purple-500/5" />
          <div className="container relative py-12 md:py-16">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium bg-background/50 backdrop-blur mb-4">
                <FileArchive className="h-4 w-4 text-primary" />
                5 minute setup
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Export Your YouTube Data
              </h1>
              <p className="mt-3 text-muted-foreground">
                Follow these steps to get your watch history from Google Takeout.
              </p>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="container py-12 md:py-16">
          <div className="mx-auto max-w-4xl space-y-6">
            {steps.map((step, index) => (
              <div 
                key={step.number} 
                className="group relative rounded-2xl border bg-card p-6 md:p-8 transition-all hover:shadow-md"
              >
                <div className="flex gap-5 md:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-lg md:text-xl font-bold shadow-lg">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">{step.description}</p>
                    {step.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="container pb-16">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border bg-card p-6 md:p-8 text-center">
              <h2 className="text-xl md:text-2xl font-bold mb-2">Ready to see your stats?</h2>
              <p className="text-muted-foreground mb-6">
                Once your export is in Google Drive, sign in and we&apos;ll do the rest!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/">
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="https://takeout.google.com" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Download className="h-4 w-4" /> Open Google Takeout
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            <span className="font-semibold">YouTube Wrapped</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} YouTube Wrapped. Not affiliated with YouTube or Google.
          </p>
          <Link href="/terms-and-privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Privacy & Terms
          </Link>
        </div>
      </footer>
    </div>
  )
} 