-- CreateEnum
CREATE TYPE "Vertical" AS ENUM ('PHOTOGRAPHY', 'MUSICIANS', 'FITNESS', 'EVENTS', 'PERFORMING_ARTS', 'TEAM_BUILDING', 'KIDS_ENTERTAINMENT');

-- CreateEnum
CREATE TYPE "GigStatus" AS ENUM ('INQUIRY', 'QUOTE_SENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SetlistStatus" AS ENUM ('DRAFT', 'FINALIZED', 'PERFORMED');

-- CreateTable
CREATE TABLE "gigs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vertical" "Vertical" NOT NULL DEFAULT 'MUSICIANS',
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "GigStatus" NOT NULL DEFAULT 'INQUIRY',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "clientName" TEXT,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "eventType" TEXT,
    "eventDate" TIMESTAMP(3),
    "eventDuration" INTEGER,
    "venue" JSONB,
    "audienceSize" INTEGER,
    "audienceAge" TEXT,
    "repertoire" JSONB,
    "setlistSongs" TEXT[],
    "bandMembers" INTEGER,
    "instruments" TEXT[],
    "genres" TEXT[],
    "setDuration" INTEGER,
    "numberOfSets" INTEGER,
    "breakDuration" INTEGER,
    "stageRider" JSONB,
    "backlineNeeded" BOOLEAN NOT NULL DEFAULT false,
    "soundcheckTime" TIMESTAMP(3),
    "soundSystemProvided" BOOLEAN NOT NULL DEFAULT false,
    "hasOwnPA" BOOLEAN NOT NULL DEFAULT true,
    "basePrice" INTEGER,
    "travelCosts" INTEGER,
    "totalPrice" INTEGER,
    "deposit" INTEGER,
    "depositPaid" BOOLEAN NOT NULL DEFAULT false,
    "description" JSONB,
    "internalNotes" TEXT,
    "featuredImageUrl" TEXT,
    "featuredImageAlt" TEXT,
    "galleryImages" JSONB,

    CONSTRAINT "gigs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setlists" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vertical" "Vertical" NOT NULL DEFAULT 'MUSICIANS',
    "name" TEXT NOT NULL,
    "status" "SetlistStatus" NOT NULL DEFAULT 'DRAFT',
    "gigId" TEXT,
    "totalDuration" INTEGER NOT NULL,
    "mood" TEXT,
    "songs" JSONB NOT NULL,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiPrompt" TEXT,
    "generatedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "setlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gig_extras" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vertical" "Vertical" NOT NULL DEFAULT 'MUSICIANS',
    "gigId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "gig_extras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repertoire_songs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vertical" "Vertical" NOT NULL DEFAULT 'MUSICIANS',
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "genre" TEXT,
    "mood" TEXT,
    "duration" INTEGER NOT NULL,
    "key" TEXT,
    "bpm" INTEGER,
    "difficulty" TEXT,
    "instruments" TEXT[],
    "vocals" TEXT,
    "timesPerformed" INTEGER NOT NULL DEFAULT 0,
    "lastPerformed" TIMESTAMP(3),
    "tags" TEXT[],
    "spotifyUrl" TEXT,
    "youtubeUrl" TEXT,
    "sheetMusicUrl" TEXT,
    "notes" TEXT,

    CONSTRAINT "repertoire_songs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stage_rider_templates" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vertical" "Vertical" NOT NULL DEFAULT 'MUSICIANS',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "inputList" JSONB,
    "monitorSetup" JSONB,
    "backlineNeeds" JSONB,
    "stagePlot" TEXT,
    "powerNeeds" TEXT,
    "soundcheckDuration" INTEGER,
    "setupTime" INTEGER,
    "teardownTime" INTEGER,
    "greenRoomNeeds" TEXT,
    "parkingNeeds" TEXT,
    "otherRequirements" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "stage_rider_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "vertical" "Vertical" NOT NULL,
    "bandName" TEXT,
    "bandBio" TEXT,
    "bandGenres" TEXT[],
    "bandSize" INTEGER,
    "logoUrl" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "socialLinks" JSONB,
    "settings" JSONB,
    "plan" TEXT NOT NULL DEFAULT 'starter',
    "planExpiry" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "avatar" TEXT,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "address" JSONB,
    "tags" TEXT[],
    "notes" TEXT,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "customerId" TEXT NOT NULL,
    "gigId" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "subtotal" INTEGER NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL,
    "paidAmount" INTEGER NOT NULL DEFAULT 0,
    "items" JSONB NOT NULL,
    "notes" TEXT,
    "pdfUrl" TEXT,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "gigs_slug_key" ON "gigs"("slug");

-- CreateIndex
CREATE INDEX "gigs_tenantId_idx" ON "gigs"("tenantId");

-- CreateIndex
CREATE INDEX "gigs_status_idx" ON "gigs"("status");

-- CreateIndex
CREATE INDEX "gigs_eventDate_idx" ON "gigs"("eventDate");

-- CreateIndex
CREATE INDEX "gigs_slug_idx" ON "gigs"("slug");

-- CreateIndex
CREATE INDEX "setlists_tenantId_idx" ON "setlists"("tenantId");

-- CreateIndex
CREATE INDEX "setlists_gigId_idx" ON "setlists"("gigId");

-- CreateIndex
CREATE INDEX "setlists_status_idx" ON "setlists"("status");

-- CreateIndex
CREATE INDEX "gig_extras_tenantId_idx" ON "gig_extras"("tenantId");

-- CreateIndex
CREATE INDEX "gig_extras_gigId_idx" ON "gig_extras"("gigId");

-- CreateIndex
CREATE INDEX "repertoire_songs_tenantId_idx" ON "repertoire_songs"("tenantId");

-- CreateIndex
CREATE INDEX "repertoire_songs_genre_idx" ON "repertoire_songs"("genre");

-- CreateIndex
CREATE INDEX "repertoire_songs_mood_idx" ON "repertoire_songs"("mood");

-- CreateIndex
CREATE INDEX "stage_rider_templates_tenantId_idx" ON "stage_rider_templates"("tenantId");

-- CreateIndex
CREATE INDEX "stage_rider_templates_isDefault_idx" ON "stage_rider_templates"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_vertical_idx" ON "tenants"("vertical");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "customers_tenantId_idx" ON "customers"("tenantId");

-- CreateIndex
CREATE INDEX "customers_email_idx" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_tenantId_email_key" ON "customers"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_tenantId_idx" ON "invoices"("tenantId");

-- CreateIndex
CREATE INDEX "invoices_customerId_idx" ON "invoices"("customerId");

-- CreateIndex
CREATE INDEX "invoices_gigId_idx" ON "invoices"("gigId");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_invoiceNumber_idx" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "setlists" ADD CONSTRAINT "setlists_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "gigs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gig_extras" ADD CONSTRAINT "gig_extras_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "gigs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "gigs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
