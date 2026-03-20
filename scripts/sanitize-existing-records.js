/**
 * Cleanup: Sanitize existing NewsStory and Challenge records
 * Removes emoji from storyJson and challenge options in database
 */

import { NewsStory, Challenge } from '../server/models/index.js';
import { sanitizeStoryJson, sanitizeChallengeOptions } from '../server/utils/sanitization.js';
import { logger } from '../server/utils/logger.js';

async function sanitizeExistingRecords() {
  try {
    console.log('Starting sanitization of existing records...\n');

    // Sanitize NewsStory records
    console.log('Sanitizing NewsStory records...');
    const newsStories = await NewsStory.findAll({ paranoid: false });
    let updatedCount = 0;

    for (const story of newsStories) {
      if (story.storyJson) {
        const sanitized = sanitizeStoryJson(story.storyJson);
        if (JSON.stringify(sanitized) !== JSON.stringify(story.storyJson)) {
          await story.update({ storyJson: sanitized });
          updatedCount++;
          console.log(`✓ Updated story: ${story.title}`);
        }
      }
    }
    console.log(`NewsStory: ${updatedCount}/${newsStories.length} records updated\n`);

    // Sanitize Challenge records
    console.log('Sanitizing Challenge records...');
    const challenges = await Challenge.findAll();
    updatedCount = 0;

    for (const challenge of challenges) {
      if (challenge.options && Array.isArray(challenge.options)) {
        const sanitized = sanitizeChallengeOptions(challenge.options);
        if (JSON.stringify(sanitized) !== JSON.stringify(challenge.options)) {
          await challenge.update({ options: sanitized });
          updatedCount++;
          console.log(`✓ Updated challenge: ${challenge.title}`);
        }
      }
    }
    console.log(`Challenge: ${updatedCount}/${challenges.length} records updated\n`);

    console.log('✅ Sanitization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sanitization failed:', error);
    process.exit(1);
  }
}

sanitizeExistingRecords();
