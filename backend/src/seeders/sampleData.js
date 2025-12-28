const db = require('../models');

async function seedSampleData() {
  try {
    // Users
    const admin = await db.User.create({
      username: 'admin',
      email: 'admin@stot-ub.com',
      password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uK.G', // 'admin123' bcrypt
      role: 'admin',
      first_name: 'System',
      last_name: 'Administrator',
      is_active: true
    });
    const operator = await db.User.create({
      username: 'operator1',
      email: 'operator1@stot-ub.com',
      password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uK.G',
      role: 'operator',
      first_name: 'Op',
      last_name: 'One',
      is_active: true
    });

    // UAVs
    const uav = await db.UAV.create({
      uav_id: 'UAV-001',
      model: 'DJI Matrice 600 Pro',
      manufacturer: 'DJI',
      max_payload: 6.0,
      max_range: 5.0,
      max_flight_time: 40,
      battery_capacity: 6.0,
      current_battery: 6.0,
      status: 'available',
    });

    // Organs
    const organ = await db.Organ.create({
      organ_id: 'ORG-001',
      organ_type: 'heart',
      blood_type: 'O+',
      donor_id: 'DONOR-001',
      recipient_id: 'RECIPIENT-001',
      donor_hospital: 'City Hospital',
      recipient_hospital: 'Metro Hospital',
      donor_location_lat: 28.6139,
      donor_location_lng: 77.2090,
      recipient_location_lat: 28.7041,
      recipient_location_lng: 77.1025,
      priority_level: 'urgent',
      status: 'pending',
      preservation_time_limit: 6,
      assigned_uav_id: uav.uav_id,
      assigned_operator_id: operator.id
    });

    // Transport
    const transport = await db.Transport.create({
      transport_id: 'TRANS-001',
      organ_id: organ.organ_id,
      uav_id: uav.uav_id,
      operator_id: operator.id,
      start_time: new Date(),
      start_location_lat: 28.6139,
      start_location_lng: 77.2090,
      status: 'in_transit',
    });

    // SensorReading
    await db.SensorReading.create({
      transport_id: transport.transport_id,
      organ_id: organ.organ_id,
      uav_id: uav.uav_id,
      temperature: 4.5,
      humidity: 55.0,
      altitude: 120.0,
      latitude: 28.6500,
      longitude: 77.2000,
    });

    // BlockchainTransaction
    await db.BlockchainTransaction.create({
      event_type: 'organ_registered',
      organ_id: organ.organ_id,
      operator_address: '0x1234567890abcdef1234567890abcdef12345678',
      transaction_hash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
      status: 'confirmed',
    });

    // AuditLog
    await db.AuditLog.create({
      user_id: admin.id,
      action: 'CREATE_ORGAN',
      table_name: 'organs',
      record_id: organ.organ_id,
      new_values: organ.toJSON(),
      ip_address: '127.0.0.1',
      user_agent: 'SeederScript/1.0'
    });

    console.log('Sample data seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding sample data:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedSampleData();
}

module.exports = seedSampleData; 