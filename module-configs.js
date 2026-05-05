/**
 * MODULE CONFIGURATION - Firebase Integration Setup for All Modules
 * This file contains the configuration for each module (pages 1-19)
 * 
 * Use with module-firebase-init.js
 */

export const MODULE_CONFIGS = {
    1: {
        moduleNumber: 1,
        title: "Module 1: How to study the Bible",
        essayFields: [
            { id: 'm1essay1', week: 1 }
        ],
        totalLessons: 1,
        quizzes: {
            1: { totalQuestions: 5 }
        }
    },
    2: {
        moduleNumber: 2,
        title: "Module 2: From Genesis to the Cross",
        essayFields: [
            { id: 'm2essay1', week: 1 },
            { id: 'm2essay2', week: 2 },
            { id: 'm2essay3', week: 3 }
        ],
        totalLessons: 4,
        quizzes: {
            1: { totalQuestions: 6 },
            2: { totalQuestions: 5 },
            3: { totalQuestions: 9 }
        }
    },
    3: {
        moduleNumber: 3,
        title: "Module 3: Identity in Christ",
        essayFields: [
            { id: 'm3essay1', week: 1 },
            { id: 'm3essay2', week: 2 },
            { id: 'm3essay3', week: 3 }
        ],
        totalLessons: 2,
        quizzes: {
            1: { totalQuestions: 6 },
            2: { totalQuestions: 7 }
        }
    },
    4: {
        moduleNumber: 4,
        title: "Module 4: Biblical Worldview",
        essayFields: [
            { id: 'm4essay1', week: 1 },
            { id: 'm4essay2', week: 2 },
            { id: 'm4essay3', week: 3 }
        ],
        totalLessons: 4,
        quizzes: {
            1: { totalQuestions: 9 },
            2: { totalQuestions: 8 },
            3: { totalQuestions: 8 },
            4: { totalQuestions: 4 }
        }
    },
    5: {
        moduleNumber: 5,
        title: "Module 5: Doctrines, Creeds, & The Early Church",
        essayFields: [],
        totalLessons: 2,
        quizzes: {
            1: { totalQuestions: 10 },
            2: { totalQuestions: 10 }
        }
    },
    6: {
        moduleNumber: 6,
        title: "Module 6: Calvinism versus Arminianism",
        essayFields: [
            { id: 'm6essay1', week: 1 }
        ],
        totalLessons: 2,
        quizzes: {
            1: { totalQuestions: 10 },
            2: { totalQuestions: 10 }
        }
    },
    7: {
        moduleNumber: 7,
        title: "Module 7: The Kingdom of God",
        essayFields: [],
        totalLessons: 4,
        quizzes: {
            1: { totalQuestions: 12 },
            2: { totalQuestions: 8 },
            3: { totalQuestions: 9 },
            4: { totalQuestions: 10 }
        }
    },
    8: {
        moduleNumber: 8,
        title: "Module 8: The Local and Universal Body of Christ",
        essayFields: [],
        totalLessons: 4,
        quizzes: {}
    },
    9: {
        moduleNumber: 9,
        title: "Module 9",
        essayFields: [],
        totalLessons: 1,
        quizzes: {}
    },
    10: {
        moduleNumber: 10,
        title: "Module 10",
        essayFields: [],
        totalLessons: 1,
        quizzes: {}
    },
    11: {
        moduleNumber: 11,
        title: "Module 11",
        essayFields: [],
        totalLessons: 1,
        quizzes: {}
    },
    12: {
        moduleNumber: 12,
        title: "Module 12",
        essayFields: [],
        totalLessons: 1,
        quizzes: {}
    },
    13: {
        moduleNumber: 13,
        title: "Module 13",
        essayFields: [],
        totalLessons: 1,
        quizzes: {}
    },
    14: {
        moduleNumber: 14,
        title: "Module 14",
        essayFields: [],
        totalLessons: 1,
        quizzes: {}
    },
    15: {
        moduleNumber: 15,
        title: "Module 15",
        essayFields: [],
        totalLessons: 1,
        quizzes: {}
    },
    16: {
        moduleNumber: 16,
        title: "Module 16",
        essayFields: [],
        totalLessons: 1,
        quizzes: {}
    },
    17: {
        moduleNumber: 17,
        title: "Module 17",
        essayFields: [],
        totalLessons: 1,
        quizzes: {}
    },
    18: {
        moduleNumber: 18,
        title: "Module 18",
        essayFields: [],
        totalLessons: 1,
        quizzes: {}
    },
    19: {
        moduleNumber: 19,
        title: "Module 19",
        essayFields: [],
        totalLessons: 1,
        quizzes: {}
    }
};

/**
 * Helper function to get module config
 */
export function getModuleConfig(moduleNumber) {
    return MODULE_CONFIGS[moduleNumber] || MODULE_CONFIGS[1];
}
