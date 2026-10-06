const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { getDbState } = require('../config/db');

// Helper to generate formatted tracking ID
const generateTrackingId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CMP-${year}-${randomNum}`;
};

// ==========================================
// 1. Mongoose Schema (for MongoDB Atlas)
// ==========================================
const complaintSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      unique: true,
      default: generateTrackingId
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        'IT & Lab Infrastructure',
        'Academic & Examination',
        'Hostel & Residential',
        'Sanitation & Cleanliness',
        'Transport & Parking',
        'Campus Security & Safety',
        'General Administration'
      ]
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    description: {
      type: String,
      required: true
    },
    complainantName: {
      type: String,
      required: true,
      trim: true
    },
    complainantEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    complainantPhone: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      default: 'Unassigned'
    },
    assignedOfficer: {
      type: String,
      default: 'Pending Assignment'
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Submitted'
    },
    attachment: {
      url: String,
      publicId: String,
      filename: String,
      size: Number,
      mimetype: String,
      storageProvider: String,
      uploadedAt: Date
    },
    timeline: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: String, default: 'System' },
        comments: String
      }
    ],
    resolutionNotes: {
      type: String,
      default: ''
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comments: String,
      submittedAt: Date
    }
  },
  {
    timestamps: true
  }
);

let MongooseComplaintModel;
try {
  MongooseComplaintModel = mongoose.model('Complaint', complaintSchema);
} catch (e) {
  MongooseComplaintModel = mongoose.models.Complaint;
}

// ==========================================
// 2. Local Resilient File Adapter
// ==========================================
const dataFilePath = path.join(__dirname, '..', 'data', 'complaints.json');

const ensureDataDir = () => {
  const dir = path.dirname(dataFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const readData = () => {
  try {
    ensureDataDir();
    if (!fs.existsSync(dataFilePath)) {
      const initialSeed = getInitialSeedData();
      fs.writeFileSync(dataFilePath, JSON.stringify(initialSeed, null, 2));
      return initialSeed;
    }
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading complaints.json:', err.message);
    return [];
  }
};

const writeData = (data) => {
  try {
    ensureDataDir();
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing complaints.json:', err.message);
  }
};

const getInitialSeedData = () => [
  {
    _id: 'seed-001',
    trackingId: 'CMP-2026-1042',
    title: 'Wi-Fi connectivity dropping in Computer Lab 3',
    category: 'IT & Lab Infrastructure',
    priority: 'High',
    description: 'The access point in Lab 3 keeps rebooting every 10 minutes, disrupting students during Cloud Computing practical lab sessions.',
    complainantName: 'Rohan Sharma',
    complainantEmail: 'rohan.sharma@college.edu',
    complainantPhone: '+91 98765 43210',
    department: 'Network Operations Cell',
    assignedOfficer: 'Er. Rajesh Kumar',
    status: 'In Progress',
    attachment: null,
    timeline: [
      {
        status: 'Submitted',
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        updatedBy: 'System Portal',
        comments: 'Grievance ticket created in Cloud Database'
      },
      {
        status: 'Under Review',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        updatedBy: 'Helpdesk Admin',
        comments: 'Forwarded to Network Operations team'
      },
      {
        status: 'In Progress',
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        updatedBy: 'Er. Rajesh Kumar',
        comments: 'Access point firmware upgrade and VLAN router reset scheduled'
      }
    ],
    resolutionNotes: '',
    feedback: null,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    _id: 'seed-002',
    trackingId: 'CMP-2026-2187',
    title: 'Water cooler purification filter replacement in Block B',
    category: 'Sanitation & Cleanliness',
    priority: 'Urgent',
    description: 'The water cooler on the second floor of Block B has muddy output and requires urgent RO cartridge replacement.',
    complainantName: 'Priya Verma',
    complainantEmail: 'priya.verma@college.edu',
    complainantPhone: '+91 91234 56789',
    department: 'Campus Facilities & Maintenance',
    assignedOfficer: 'Mr. Sunil Patil',
    status: 'Resolved',
    attachment: null,
    timeline: [
      {
        status: 'Submitted',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        updatedBy: 'System Portal',
        comments: 'Ticket logged'
      },
      {
        status: 'In Progress',
        timestamp: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
        updatedBy: 'Maintenance Supervisor',
        comments: 'Technician dispatched with replacement membrane'
      },
      {
        status: 'Resolved',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        updatedBy: 'Mr. Sunil Patil',
        comments: 'RO filter replaced, TDS levels verified safe (<90 ppm)'
      }
    ],
    resolutionNotes: 'Filter cartridge and UV lamp replaced successfully. Water sample verified.',
    feedback: {
      rating: 5,
      comments: 'Prompt resolution within 24 hours. Excellent support!',
      submittedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    },
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  },
  {
    _id: 'seed-003',
    trackingId: 'CMP-2026-3094',
    title: 'Projector HDMI port damaged in Seminar Hall A',
    category: 'Academic & Examination',
    priority: 'Medium',
    description: 'The wall-mounted HDMI cable socket is loose and causes screen flickering during seminars.',
    complainantName: 'Prof. Ananya Sen',
    complainantEmail: 'ananya.sen@college.edu',
    complainantPhone: '+91 99887 76655',
    department: 'Audio-Visual Cell',
    assignedOfficer: 'Pending Assignment',
    status: 'Submitted',
    attachment: null,
    timeline: [
      {
        status: 'Submitted',
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        updatedBy: 'System Portal',
        comments: 'Grievance ticket created in Cloud Database'
      }
    ],
    resolutionNotes: '',
    feedback: null,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  }
];

// Initialize seed data if file doesn't exist
readData();

// ==========================================
// 3. Unified Repository Layer
// ==========================================
class ComplaintRepository {
  static async create(complaintData) {
    const dbState = getDbState();
    if (dbState.isMongo) {
      const doc = new MongooseComplaintModel(complaintData);
      return await doc.save();
    }

    const items = readData();
    const newItem = {
      _id: 'cmp_' + Date.now() + Math.random().toString(36).substr(2, 4),
      trackingId: complaintData.trackingId || generateTrackingId(),
      title: complaintData.title,
      category: complaintData.category,
      priority: complaintData.priority || 'Medium',
      description: complaintData.description,
      complainantName: complaintData.complainantName,
      complainantEmail: complaintData.complainantEmail,
      complainantPhone: complaintData.complainantPhone || '',
      department: complaintData.department || 'Unassigned',
      assignedOfficer: complaintData.assignedOfficer || 'Pending Assignment',
      status: complaintData.status || 'Submitted',
      attachment: complaintData.attachment || null,
      timeline: complaintData.timeline || [
        {
          status: 'Submitted',
          timestamp: new Date().toISOString(),
          updatedBy: 'System Portal',
          comments: 'Grievance ticket registered in Cloud System'
        }
      ],
      resolutionNotes: complaintData.resolutionNotes || '',
      feedback: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.unshift(newItem);
    writeData(items);
    return newItem;
  }

  static async find(query = {}) {
    const dbState = getDbState();
    if (dbState.isMongo) {
      return await MongooseComplaintModel.find(query).sort({ createdAt: -1 });
    }

    let items = readData();

    if (query.status && query.status !== 'All') {
      items = items.filter((item) => item.status === query.status);
    }
    if (query.category && query.category !== 'All') {
      items = items.filter((item) => item.category === query.category);
    }
    if (query.priority && query.priority !== 'All') {
      items = items.filter((item) => item.priority === query.priority);
    }
    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.trackingId.toLowerCase().includes(s) ||
          item.title.toLowerCase().includes(s) ||
          item.complainantName.toLowerCase().includes(s) ||
          item.description.toLowerCase().includes(s)
      );
    }

    // Sort by createdAt descending
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async findByTrackingId(trackingId) {
    const dbState = getDbState();
    if (dbState.isMongo) {
      return await MongooseComplaintModel.findOne({
        trackingId: { $regex: new RegExp(`^${trackingId.trim()}$`, 'i') }
      });
    }

    const items = readData();
    const cleanId = trackingId.trim().toUpperCase();
    return items.find((item) => item.trackingId.toUpperCase() === cleanId) || null;
  }

  static async findById(id) {
    const dbState = getDbState();
    if (dbState.isMongo) {
      return await MongooseComplaintModel.findById(id);
    }

    const items = readData();
    return items.find((item) => item._id === id || item.trackingId === id) || null;
  }

  static async updateStatus(id, newStatus, comments, updatedBy = 'Admin Officer', assignedOfficer, department, resolutionNotes) {
    const dbState = getDbState();
    const timelineEntry = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      updatedBy,
      comments: comments || `Status changed to ${newStatus}`
    };

    if (dbState.isMongo) {
      const updateData = {
        status: newStatus,
        updatedAt: new Date(),
        $push: { timeline: timelineEntry }
      };
      if (assignedOfficer) updateData.assignedOfficer = assignedOfficer;
      if (department) updateData.department = department;
      if (resolutionNotes !== undefined) updateData.resolutionNotes = resolutionNotes;

      return await MongooseComplaintModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    const items = readData();
    const index = items.findIndex((item) => item._id === id || item.trackingId === id);
    if (index === -1) return null;

    const item = items[index];
    item.status = newStatus;
    item.updatedAt = new Date().toISOString();
    if (assignedOfficer) item.assignedOfficer = assignedOfficer;
    if (department) item.department = department;
    if (resolutionNotes !== undefined) item.resolutionNotes = resolutionNotes;
    item.timeline.push(timelineEntry);

    items[index] = item;
    writeData(items);
    return item;
  }

  static async submitFeedback(trackingId, rating, comments) {
    const dbState = getDbState();
    const feedbackObj = {
      rating: Number(rating),
      comments: comments || '',
      submittedAt: new Date().toISOString()
    };

    if (dbState.isMongo) {
      return await MongooseComplaintModel.findOneAndUpdate(
        { trackingId: { $regex: new RegExp(`^${trackingId.trim()}$`, 'i') } },
        { feedback: feedbackObj },
        { new: true }
      );
    }

    const items = readData();
    const index = items.findIndex(
      (item) => item.trackingId.toUpperCase() === trackingId.trim().toUpperCase()
    );
    if (index === -1) return null;

    items[index].feedback = feedbackObj;
    writeData(items);
    return items[index];
  }

  static async getStats() {
    const items = await this.find({});
    const total = items.length;
    const submitted = items.filter((i) => i.status === 'Submitted').length;
    const underReview = items.filter((i) => i.status === 'Under Review').length;
    const inProgress = items.filter((i) => i.status === 'In Progress').length;
    const resolved = items.filter((i) => i.status === 'Resolved').length;
    const rejected = items.filter((i) => i.status === 'Rejected').length;

    // Category breakdown
    const categoryCounts = {};
    const priorityCounts = { Low: 0, Medium: 0, High: 0, Urgent: 0 };

    items.forEach((i) => {
      categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
      if (priorityCounts[i.priority] !== undefined) {
        priorityCounts[i.priority]++;
      }
    });

    const ratedItems = items.filter((i) => i.feedback && i.feedback.rating);
    const avgRating = ratedItems.length
      ? (ratedItems.reduce((acc, curr) => acc + curr.feedback.rating, 0) / ratedItems.length).toFixed(1)
      : 'N/A';

    return {
      total,
      submitted,
      underReview,
      inProgress,
      resolved,
      rejected,
      resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) + '%' : '0%',
      categoryCounts,
      priorityCounts,
      avgRating,
      ratedCount: ratedItems.length
    };
  }
}

module.exports = ComplaintRepository;
