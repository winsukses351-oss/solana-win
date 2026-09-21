import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/db';

export async function GET() {
  let settings = await prisma.settings.findUnique({ where: { id: 'default' } });
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: 'default' } });
  }
  return NextResponse.json(settings);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Strict backend validation
    const maxLossUsd = body.maxDailyLossUsd !== undefined ? Number(body.maxDailyLossUsd) : null;
    const maxPosUsd = body.maxPositionUsd !== undefined ? Number(body.maxPositionUsd) : null;
    
    const settings = await prisma.settings.upsert({
      where: { id: 'default' },
      update: {
        tradingEnabled: Boolean(body.tradingEnabled),
        compoundingEnabled: Boolean(body.compoundingEnabled),
        startingCapitalUsd: Number(body.startingCapitalUsd) || 10,
        riskPerTradePercent: Number(body.riskPerTradePercent) || 1,
        maxPositionPercent: Number(body.maxPositionPercent) || 10,
        maxDailyLossPercent: Number(body.maxDailyLossPercent) || 3,
        maxPositionUsd: maxPosUsd,
        maxDailyLossUsd: maxLossUsd,
        maxOpenPositions: Number(body.maxOpenPositions) || 2,
        minLiquidityUsd: Number(body.minLiquidityUsd) || 10000,
        minScore: Number(body.minScore) || 80,
        killSwitch: Boolean(body.killSwitch),
      },
      create: {
        id: 'default'
      }
    });

    if (settings.killSwitch) {
       await prisma.riskEvent.create({
         data: { level: 'CRITICAL', message: 'Kill switch activated via API' }
       });
    }

    return NextResponse.json(settings);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
