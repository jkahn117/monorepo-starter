#!/usr/bin/env tsx
/**
 * Generate wrangler.toml from wrangler.config.ts
 */

import { writeFileSync } from "node:fs";
import { generateTOML } from "@repo/wrangler-config";
import config from "../wrangler.config.js";

const toml = generateTOML(config);
writeFileSync("wrangler.toml", toml, "utf-8");

console.log("✅ Generated wrangler.toml");
