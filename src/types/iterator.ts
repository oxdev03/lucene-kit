export interface IteratorConfig {
  /**
   * Defaults to Infinity
   */
  maxDepth: number;
  /**
   * Feature flag to control whether private fields should no be iterated for wildcard queries, if not explicitly specified
   */
  featureEnablePrivateField: boolean;
}
