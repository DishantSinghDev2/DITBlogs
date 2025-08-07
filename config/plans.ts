import { Plan } from "@prisma/client";

export const PLAN_LIMITS = {
  [Plan.FREE]: {
    posts: 20,
    members: 1,
    viewsPerMonth: 2500,
    categories: 5,   // <-- New Limit
    tagsPerPost: 3,  // <-- New Limit
  },
  [Plan.GROWTH]: {
    posts: Infinity,
    members: 5,
    viewsPerMonth: 50000,
    categories: 20,  // <-- New Limit
    tagsPerPost: 10, // <-- New Limit
  },
  [Plan.SCALE]: {
    posts: Infinity,
    members: 15,
    viewsPerMonth: 250000,
    categories: Infinity, // <-- New Limit
    tagsPerPost: Infinity, // <-- New Limit
  },
  [Plan.CUSTOM]: {
    posts: Infinity,
    members: Infinity,
    viewsPerMonth: Infinity,
    categories: Infinity, // <-- New Limit
    tagsPerPost: Infinity, // <-- New Limit
  },
};