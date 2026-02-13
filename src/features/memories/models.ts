import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { chatMemories as memories } from "@/core/database/schema";

export { memories };

export type Memory = InferSelectModel<typeof memories>;
export type NewMemory = InferInsertModel<typeof memories>;
