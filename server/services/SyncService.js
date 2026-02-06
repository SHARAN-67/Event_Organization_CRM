const mongoose = require('mongoose');
const path = require('path');

// Models to sync definition
const getModelsToSync = () => {
    return [
        { name: 'User', schema: require('../models/User').schema },
        { name: 'Lead', schema: require('../models/Lead').schema },
        { name: 'Contact', schema: require('../models/Contact').schema },
        { name: 'Event', schema: require('../models/Event').schema },
        { name: 'Deal', schema: require('../models/deal').schema, displayName: 'Pipeline (Deals)' },
        { name: 'Task', schema: require('../models/task').schema },
        { name: 'Product', schema: require('../models/product').schema },
        { name: 'Order', schema: require('../models/order').schema },
        { name: 'Invoice', schema: require('../models/invoice').schema },
        { name: 'Vendor', schema: require('../models/vendor').schema },
        { name: 'Document', schema: require('../models/Document').schema },
        { name: 'Campaign', schema: require('../models/Campaign').schema },
        { name: 'Report', schema: require('../models/Report').schema },
        { name: 'Venue', schema: require('../models/Venue').schema },
        { name: 'ActivityLog', schema: require('../models/ActivityLog').schema },
        { name: 'EventAnalytics', schema: require('../models/EventAnalytics').schema },
        { name: 'ManualOverride', schema: require('../models/ManualOverride').schema },
        { name: 'CompanyConfig', schema: require('../models/CompanyConfig').schema },
        { name: 'AccessRule', schema: require('../models/AccessRule').schema }
    ];
};

/**
 * Syncs data from Local Database to Cloud Database
 * @param {Object} options - Sync options
 * @param {boolean} options.excludeActivities - Whether to exclude Activity related models (Event, Task)
 * @returns {Promise<Object>} - Sync results
 */
const syncLocalToCloud = async (options = { excludeActivities: false }) => {
    let localConn = null;
    let cloudConn = null;

    // Define activity-related models to potentially exclude
    const activityModels = ['Event', 'Task', 'ActivityLog'];

    try {
        console.log("🔄 Initiating Sync: Connecting to Local and Cloud DBs...");

        const localURI = process.env.MONGO_URI_LOCAL;
        const cloudURI = process.env.MONGO_URI_CLOUD;

        if (!localURI || !cloudURI) {
            throw new Error("Missing MongoDB URIs in environment variables.");
        }

        // Use createConnection to avoid interfering with the main app connection
        localConn = await mongoose.createConnection(localURI).asPromise();
        cloudConn = await mongoose.createConnection(cloudURI).asPromise();

        console.log("✅ Custom sync connections established.");

        let models = getModelsToSync();

        if (options.excludeActivities) {
            console.log("ℹ️ Excluding Activities (Event, Task, ActivityLog) from sync as requested.");
            models = models.filter(m => !activityModels.includes(m.name));
        }

        const results = {
            synced: [],
            errors: []
        };

        // Perform Sync
        for (const modelDef of models) {
            try {
                // Register models on the specific connections
                // Check if model is already registered to avoid OverwriteModelError
                const LocalModel = localConn.models[modelDef.name] || localConn.model(modelDef.name, modelDef.schema);
                const CloudModel = cloudConn.models[modelDef.name] || cloudConn.model(modelDef.name, modelDef.schema);

                // Fetch all data from Local
                const localData = await LocalModel.find();

                if (localData.length > 0) {
                    console.log(`📤 Syncing ${localData.length} ${modelDef.name} records...`);

                    // Bulk Write to Cloud (Upsert based on _id)
                    const updates = localData.map(doc => ({
                        updateOne: {
                            filter: { _id: doc._id },
                            update: { $set: doc.toObject() },
                            upsert: true
                        }
                    }));

                    await CloudModel.bulkWrite(updates);
                    results.synced.push({
                        model: modelDef.displayName || modelDef.name,
                        count: localData.length
                    });
                } else {
                    results.synced.push({
                        model: modelDef.displayName || modelDef.name,
                        count: 0
                    });
                }
            } catch (innerErr) {
                console.error(`❌ Error syncing ${modelDef.name}:`, innerErr);
                results.errors.push({
                    model: modelDef.displayName || modelDef.name,
                    error: innerErr.message
                });
            }
        }

        console.log("✅ Database Synchronization Complete.");
        return results;

    } catch (err) {
        console.error("❌ Sync Fatal Error:", err);
        throw err;
    } finally {
        // Close temporary connections
        if (localConn) await localConn.close();
        if (cloudConn) await cloudConn.close();
    }
};

module.exports = {
    syncLocalToCloud
};
