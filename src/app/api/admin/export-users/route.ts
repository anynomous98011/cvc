import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';
import { requireAdminUser } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users with logs
    const users = await prisma.user.findMany({
      include: {
        userLogs: true,
      },
    });

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    // Headers
    worksheet.columns = [
      { header: 'User ID', key: 'id', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Email Verified', key: 'isEmailVerified', width: 15 },
      { header: 'Created Via', key: 'createdVia', width: 15 },
      { header: 'Current Device ID', key: 'currentDeviceId', width: 30 },
      { header: 'Last Device', key: 'lastDeviceFingerprint', width: 30 },
      { header: 'Log Action', key: 'logAction', width: 20 },
      { header: 'Log IP', key: 'logIp', width: 20 },
      { header: 'Log Device', key: 'logDevice', width: 30 },
      { header: 'Log Timestamp', key: 'logTimestamp', width: 25 },
    ];

    // Add data
    users.forEach((user) => {
      if (user.userLogs.length > 0) {
        user.userLogs.forEach((log) => {
          worksheet.addRow({
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            isEmailVerified: user.isEmailVerified,
            createdVia: user.createdVia,
            currentDeviceId: user.currentDeviceId,
            lastDeviceFingerprint: user.lastDeviceFingerprint,
            logAction: log.action,
            logIp: log.ip,
            logDevice: log.deviceFingerprint,
            logTimestamp: log.timestamp,
          });
        });
      } else {
        worksheet.addRow({
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
          createdVia: user.createdVia,
          currentDeviceId: user.currentDeviceId,
          lastDeviceFingerprint: user.lastDeviceFingerprint,
        });
      }
    });

    // Set response headers for Excel download
    const buffer = await workbook.xlsx.writeBuffer();
    const response = new NextResponse(buffer);
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.headers.set('Content-Disposition', 'attachment; filename=users.xlsx');

    return response;
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

