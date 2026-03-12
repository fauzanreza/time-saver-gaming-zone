import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Seed default data if empty
async function seedDefaultData() {
  console.log('Seeding default data...');
  try {
    console.log('Checking device types...');
    const typeCount = await prisma.deviceType.count();
    if (typeCount === 0) {
      console.log('Seeding default device types...');
      await prisma.deviceType.createMany({
        data: [
          { name: 'Gaming PC', value: 'gaming-pc', hourlyRate: 5, isSystem: true },
          { name: 'Standard PC', value: 'pc', hourlyRate: 3, isSystem: true },
          { name: 'Console', value: 'console', hourlyRate: 4, isSystem: true },
          { name: 'Gaming Phone', value: 'phone', hourlyRate: 2, isSystem: true },
        ],
      });
    }

    console.log('Checking devices...');
    const deviceCount = await prisma.device.count();
    if (deviceCount === 0) {
      console.log('Seeding default devices...');
      await prisma.device.createMany({
        data: [
          {
            id: 'pc-001',
            name: 'Gaming PC 1',
            type: 'gaming-pc',
            status: 'available',
            hourlyRate: 5,
          },
          {
            id: 'pc-002',
            name: 'Gaming PC 2',
            type: 'gaming-pc',
            status: 'available',
            hourlyRate: 5,
          },
          {
            id: 'pc-004',
            name: 'Standard PC 1',
            type: 'pc',
            status: 'available',
            hourlyRate: 3,
          },
        ],
      });
    }

    console.log('Checking duration suggestions...');
    const suggestionCount = await prisma.durationSuggestion.count();
    if (suggestionCount === 0) {
      console.log('Seeding default duration suggestions...');
      await prisma.durationSuggestion.createMany({
        data: [
          { label: '30 menit', minutes: 30 },
          { label: '1 jam', minutes: 60 },
          { label: '1 jam 30 menit', minutes: 90 },
          { label: '2 jam', minutes: 120 },
          { label: '3 jam', minutes: 180 },
          { label: '4 jam', minutes: 240 },
        ],
      });
    }
    console.log('Seeding successful!');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

seedDefaultData();

app.get('/api/reports', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause: any = {
      endTime: { not: null }
    };
    
    if (startDate || endDate) {
      whereClause.startTime = {};
      if (startDate) whereClause.startTime.gte = new Date(startDate as string);
      if (endDate) whereClause.startTime.lte = new Date(endDate as string);
    }
    
    const sessions = await prisma.session.findMany({
      where: whereClause,
      include: { device: true }
    });
    
    // Group sessions by day
    const reports: Record<string, any> = {};
    
    sessions.forEach((session: any) => {
      const date = session.startTime.toISOString().slice(0, 10);
      if (!reports[date]) {
        reports[date] = {
          date,
          totalRevenue: 0,
          sessionCount: 0,
          deviceRevenue: {}
        };
      }
      
      reports[date].totalRevenue += Number(session.amountCharged || 0);
      reports[date].sessionCount += 1;
      
      const type = session.device?.type || 'unknown';
      if (!reports[date].deviceRevenue[type]) {
        reports[date].deviceRevenue[type] = 0;
      }
      reports[date].deviceRevenue[type] += Number(session.amountCharged || 0);
    });
    
    // Convert to array and sort by date
    const reportsArray = Object.values(reports).sort((a: any, b: any) => 
      a.date.localeCompare(b.date)
    );
    
    res.json(reportsArray);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed' });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { endTime: { not: null } },
      orderBy: { endTime: 'desc' },
      include: { device: true },
      take: 100 // Limit to last 100 for performance
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'failed' });
  }
});

app.get('/api/state', async (req, res) => {
  try {
    const rawDevices = await prisma.device.findMany();
    const devices = rawDevices.map((d: any) => ({
      ...d,
      images: d.images ? JSON.parse(d.images) : []
    }));
    const activeSessions = await prisma.session.findMany({
      where: { endTime: null },
    });
    const savedTimes = await prisma.savedTime.findMany();
    const deviceTypes = await prisma.deviceType.findMany();
    res.json({ devices, activeSessions, savedTimes, deviceTypes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed' });
  }
});

// Device Type Routes
app.get('/api/device-types', async (req, res) => {
  const types = await prisma.deviceType.findMany();
  res.json(types);
});

app.post('/api/device-types', async (req, res) => {
  try {
    const data = req.body;
    const type = await prisma.deviceType.create({
      data: {
        name: data.name,
        value: data.value,
        hourlyRate: Number(data.hourlyRate),
        isSystem: false,
      }
    });
    res.json(type);
  } catch (error) {
    res.status(500).json({ error: 'failed' });
  }
});

app.put('/api/device-types/:id', async (req, res) => {
  try {
    const type = await prisma.deviceType.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        value: req.body.value,
        hourlyRate: Number(req.body.hourlyRate),
      }
    });
    res.json(type);
  } catch (error) {
    res.status(500).json({ error: 'failed' });
  }
});

app.delete('/api/device-types/:id', async (req, res) => {
  try {
    await prisma.deviceType.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'failed' });
  }
});

app.post('/api/start-session', async (req, res) => {
  try {
    const { deviceId, duration } = req.body;
    const device = await prisma.device.findUnique({ where: { id: deviceId } });
    if (!device) return res.status(404).json({ error: 'Device not found' });
    
    const amountCharged = (device.hourlyRate * duration) / 60;
    
    const session = await prisma.session.create({
      data: {
        id: `session-${Date.now()}`,
        deviceId,
        startTime: new Date(),
        duration,
        remainingTime: duration,
        amountCharged,
      },
    });
    
    await prisma.device.update({
      where: { id: deviceId },
      data: { status: 'in-use' },
    });
    
    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed' });
  }
});

app.post('/api/stop-session', async (req, res) => {
  try {
    const { deviceId, saveRemainingTime } = req.body;
    const session = await prisma.session.findFirst({
      where: { deviceId, endTime: null },
    });
    
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    await prisma.device.update({
      where: { id: deviceId },
      data: { status: 'available' },
    });
    
    await prisma.session.update({
      where: { id: session.id },
      data: { endTime: new Date(), remainingTime: 0 },
    });
    
    if (saveRemainingTime && session.remainingTime > 0) {
      await prisma.savedTime.create({
        data: {
          id: `saved-${Date.now()}`,
          customerIdentifier: `Customer (Session ID: ${session.id})`,
          minutes: session.remainingTime,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          isActive: true,
        },
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed' });
  }
});
app.post('/api/devices', async (req, res) => {
  try {
    const data = req.body;
    const device = await prisma.device.create({
      data: {
        name: data.name,
        type: data.type,
        status: data.status || 'available',
        hourlyRate: Number(data.hourlyRate),
        specs: data.specs,
        images: data.images ? JSON.stringify(data.images) : undefined,
      }
    });
    res.json({
      ...device,
      images: device.images ? JSON.parse(device.images) : []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed' });
  }
});

app.put('/api/devices/:id', async (req, res) => {
  try {
    const data = req.body;
    const device = await prisma.device.update({
      where: { id: req.params.id },
      data: {
        name: data.name,
        type: data.type,
        status: data.status,
        hourlyRate: Number(data.hourlyRate),
        specs: data.specs,
        images: data.images ? JSON.stringify(data.images) : undefined,
      }
    });
    res.json({
      ...device,
      images: device.images ? JSON.parse(device.images) : []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed' });
  }
});
app.delete('/api/devices/:id', async (req, res) => {
  try {
    await prisma.device.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed' });
  }
});
// Duration Suggestions
app.get('/api/duration-suggestions', async (req, res) => {
  try {
    const suggestions = await prisma.durationSuggestion.findMany({
      orderBy: { minutes: 'asc' }
    });
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: 'failed' });
  }
});

app.post('/api/duration-suggestions', async (req, res) => {
  try {
    const data = req.body;
    console.log('Received POST /api/duration-suggestions:', data);
    const suggestion = await prisma.durationSuggestion.create({
      data: {
        label: data.label,
        minutes: Number(data.minutes),
      }
    });
    res.json(suggestion);
  } catch (error) {
    console.error('Error in POST /api/duration-suggestions:', error);
    res.status(500).json({ error: 'failed' });
  }
});

app.put('/api/duration-suggestions/:id', async (req, res) => {
  try {
    const data = req.body;
    const suggestion = await prisma.durationSuggestion.update({
      where: { id: req.params.id },
      data: {
        label: data.label,
        minutes: Number(data.minutes),
      }
    });
    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ error: 'failed' });
  }
});

app.delete('/api/duration-suggestions/:id', async (req, res) => {
  try {
    await prisma.durationSuggestion.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'failed' });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

// Serve static files in production
app.use(express.static(distPath));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
