# FarmWise AI

# FARM AI – AI Farming Assistant

## Overview

Build a premium AI-powered agriculture mobile application called **Farm AI**.

The app should have the same clean, modern, and conversational experience as ChatGPT, but be focused entirely on agriculture.

The interface must be minimal, elegant, fast, and professional.

Use Dark Mode as the default theme.

---

## Brand Colors

Primary Green: #22C55E

Accent Purple: #8B5CF6

Background: #0B0B0B

Card Background: #1A1A1A

Text: #FFFFFF

Use rounded corners, smooth animations, glassmorphism where appropriate, and premium UI/UX.

---

## Home Screen

Display:

Farm AI Logo

Title:

Farm AI

Subtitle:

Your Intelligent Farming Assistant

Greeting:

Hello 👋

I'm Farm AI.

How can I help you today?

Suggested prompts:

• I want to plant rice on 2 hectares.

• Analyze this plant disease.

• Design a drip irrigation system.

• Calculate fertilizer requirements.

• Create a complete farming plan.

Bottom chat input should look similar to ChatGPT.

Input Bar includes:

+

Camera

Microphone

Send Button

---

## AI Chat

Farm AI acts as a professional agronomist.

It can answer questions about:

Crop Planning

Plant Diseases

Pests

Fertilizer

Soil Analysis

Weather

Greenhouse Farming

Hydroponics

Drip Irrigation

Livestock

Fish Farming

Farm Machinery

Harvesting

Storage

Organic Farming

Climate Smart Agriculture

Farm Economics

---

## Plant Scanner

Users can:

Take Photo

Upload Photo

AI identifies:

Plant Name

Disease

Pest

Nutrient Deficiency

Confidence Score

Treatment

Recommended Pesticide

Recommended Fertilizer

Organic Treatment

Prevention Tips

---

## Crop Planner

Users enter:

Country

State

Farm Size

Soil Type

Crop

Budget

Water Source

AI generates:

Complete Farming Plan

Land Preparation

Seed Quantity

Plant Spacing

Water Schedule

Fertilizer Schedule

Spraying Schedule

Harvest Time

Estimated Yield

Estimated Cost

Estimated Profit

Generate PDF Report

---

## Irrigation Designer

Generate:

Drip Layout

Pipe Sizes

Pump Recommendation

Tank Size

Solar Recommendation

Daily Water Requirement

Material List

Installation Guide

---

## Fertilizer Calculator

Calculate:

NPK

Urea

DAP

Potash

Organic Manure

Application Schedule

---

## Weather Intelligence

Current Weather

7-Day Forecast

Rain Alerts

Heat Alerts

Wind Alerts

Smart Farming Recommendations

---

## Farm Calendar

Automatic reminders for:

Watering

Spraying

Fertilizer

Harvesting

---

## Voice AI

Users can speak naturally.

Farm AI responds with voice.

Supported Languages:

English

Hausa

French

Arabic

---

## AI Reports

Generate professional PDF reports including:

Charts

Recommendations

Farm Analysis

---

## Subscription Plans

### FREE

Basic AI Chat

10 Messages Per Day

5 Plant Scans Per Day

Weather Updates

Basic Farming Advice

---

### GO

Price:

₦7,500/month

Features:

More AI Messages

100 Plant Scans Per Month

Voice AI

Crop Planner

Fertilizer Calculator

Irrigation Calculator

Chat History

Priority Speed

PDF Reports

---

### PRO

Price:

₦25,000/month

Everything in GO plus:

Unlimited AI Chat

Unlimited Plant Scans

Unlimited Reports

AI Farm Designer

Drip Irrigation Designer

Yield Prediction

Advanced Analytics

Priority AI Processing

Early Access Features

---

## Settings

Language

Dark Mode

Notifications

Units

Privacy

Delete Account

Subscription

---

## Technical Stack

React Native (Expo)

Supabase

AWS S3

OpenAI API

Google Gemini Vision API

Weather API

Google Maps API

Firebase Push Notifications

Paystack

Flutterwave

---

## Performance Requirements

Fast

Responsive

Secure Authentication

Offline Cache

Modern Animations

Premium User Experience

Production Ready

---

## Goal

Build the world's best AI Agriculture Assistant.

The app should feel as polished and intelligent as ChatGPT, but focused entirely on agriculture.

Every screen must look modern, premium, minimal, and beautiful.

The final product should be scalable and ready for Google Play Store and Apple App Store deployment.



Dan uwa a hadamun wanan app din na AI Kuma Dan Allah yayi kyau sosai sanan da supabase zanyi amfani sanan ka kayatar dashi komai da komai kasamai abubuwa masu matukar kyau kamar a turai sannu asa ko wanne APi na komai da aka ambata a app din saboda kowanne abu aka tambaya ya dinga bada amsa yadda ya kamata sanna yazama kowanne yare na duniya yabani yadda yadace ya turo amsa profitinal amsa Wanda babu tarkace a ciki komai yazama na kwarai yazama kamar chatgpt yayi matukar kyau sa logona asamun a ciki

FarmX AI is a production-ready mobile-first agriculture assistant powered by Google Gemini, built by SYLUTION LTD.

**Live app**: Configure your deployment URL after publishing.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```


## Environment setup

Copy the required values into your hosting provider’s secret manager. Never commit `.env` files or service-role keys.

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` and `VITE_SUPABASE_URL` | Supabase project URL for server and browser clients. |
| `SUPABASE_PUBLISHABLE_KEY` and `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key for browser authentication and RLS-backed queries. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for trusted entitlement and payment operations. |
| `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY` | Manus built-in AI provider credentials; when present, `/api/chat` uses Manus first. |
| `MANUS_CHAT_MODEL` | Optional Manus model override; defaults to `gpt-5-mini`. |
| `GEMINI_API_KEY` | Optional fallback for Gemini chat, image, and transcription capabilities. |
| `PAYSTACK_SECRET_KEY` | Server-only Paystack payment verification and webhook secret. |

The AI route keeps the existing farming prompt, quota checks, image-message support, and Supabase-backed history. It prefers Manus when the two Manus variables are available and falls back to Gemini when only the existing Gemini key is configured.
