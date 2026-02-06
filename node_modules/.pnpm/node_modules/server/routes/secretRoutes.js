const express = require('express');
const router = express.Router();
const EventAnalytics = require('../models/EventAnalytics');
const Lead = require('../models/Lead');
const ManualOverride = require('../models/ManualOverride');

// Middleware to check for secret key and return 404 if missing or invalid
const secretAuth = (req, res, next) => {
    const secretKey = req.headers['x-internal-security-token'];
    if (secretKey !== 'project-secret-v1-2026') {
        return res.status(404).send('Not Found');
    }
    next();
};

// GET all analytics data
router.get('/data', secretAuth, async (req, res) => {
    try {
        const data = await EventAnalytics.find().sort({ date: -1 });
        res.json(data);
    } catch (error) {
        res.status(404).json({ message: 'Not Found' });
    }
});

// POST new analytics entry
router.post('/manual-entry', secretAuth, async (req, res) => {
    try {
        const { eventName, actualCost, satisfactionScore, internalNotes, revenue, successRate, leadSource, category } = req.body;

        const newEntry = new EventAnalytics({
            eventName,
            actualCost,
            satisfactionScore,
            internalNotes,
            revenue: revenue || 0,
            successRate: successRate || (satisfactionScore * 10),
            leadSource: leadSource || 'Web',
            category: category || 'Corporate'
        });

        await newEntry.save();
        res.status(201).json(newEntry);
    } catch (error) {
        res.status(404).json({ message: 'Not Found' });
    }
});

// POST update manual override
router.post('/override', secretAuth, async (req, res) => {
    try {
        const { metricKey, value, isEnabled } = req.body;
        const override = await ManualOverride.findOneAndUpdate(
            { metricKey },
            { value, isEnabled },
            { upsert: true, new: true }
        );
        res.json(override);
    } catch (error) {
        res.status(404).json({ message: 'Not Found' });
    }
});

// Summary data for Dashboard with Aggregation and Overrides
router.get('/summary', secretAuth, async (req, res) => {
    try {
        // 1. Automated Aggregation Pipelines

        // Lead Source Distribution
        const leadSourceDist = await Lead.aggregate([
            { $group: { _id: "$source", count: { $sum: 1 } } },
            { $project: { name: "$_id", value: "$count" } }
        ]);

        // Basic Counts
        const totalLeadsCount = await Lead.countDocuments();
        const totalEventsCount = await EventAnalytics.countDocuments();
        const qualifiedLeads = await Lead.countDocuments({ status: { $in: ['Qualified', 'Approved', 'Processing', 'Completed'] } });

        // Financial Metrics Aggregation
        const financials = await EventAnalytics.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$revenue" },
                    totalCost: { $sum: "$actualCost" },
                    avgSatisfaction: { $sum: "$satisfactionScore" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalRevenue = financials[0]?.totalRevenue || 0;
        const totalCost = financials[0]?.totalCost || 0;
        const avgSatisfaction = financials[0] ? (financials[0].avgSatisfaction / financials[0].count) : 0;

        // Success Rate Radar Aggregated Metrics (Mocked logic based on EventAnalytics)
        const radarMetrics = [
            { subject: 'Budget Adherence', value: 85 },
            { subject: 'Timeline Efficiency', value: 90 },
            { subject: 'Lead Quality', value: 75 },
            { subject: 'Satisfaction', value: avgSatisfaction * 10 }
        ];

        // Calculations
        const calculatedROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
        const calculatedConvRate = totalLeadsCount > 0 ? (qualifiedLeads / totalLeadsCount) * 100 : 0;

        // 2. Fetch Overrides
        const overrides = await ManualOverride.find({ isEnabled: true });
        const overrideMap = overrides.reduce((acc, curr) => {
            acc[curr.metricKey] = curr.value;
            return acc;
        }, {});

        // 3. Coalesce Logic: ManualValue ?? CalculatedValue
        const finalData = {
            bigNumbers: {
                totalEvents: { value: overrideMap.totalEvents ?? totalEventsCount, isInjected: overrideMap.totalEvents !== undefined },
                totalROI: { value: overrideMap.totalROI ?? calculatedROI, isInjected: overrideMap.totalROI !== undefined },
                totalLeads: { value: overrideMap.totalLeads ?? totalLeadsCount, isInjected: overrideMap.totalLeads !== undefined },
                conversionRate: { value: overrideMap.conversionRate ?? calculatedConvRate, isInjected: overrideMap.conversionRate !== undefined },
                avgSatisfaction: avgSatisfaction
            },
            radarMetrics: {
                value: overrideMap.successRateMetrics ?? radarMetrics,
                isInjected: overrideMap.successRateMetrics !== undefined
            },
            leadSourceDist: {
                value: overrideMap.leadSourceDist ?? (leadSourceDist.length > 0 ? leadSourceDist : [{ name: 'Web', value: 1 }]),
                isInjected: overrideMap.leadSourceDist !== undefined
            },
            allData: await EventAnalytics.find().sort({ date: -1 }).limit(10)
        };

        res.json(finalData);
    } catch (error) {
        console.error("Summary Error:", error);
        res.status(404).json({ message: 'Not Found' });
    }
});

module.exports = router;
