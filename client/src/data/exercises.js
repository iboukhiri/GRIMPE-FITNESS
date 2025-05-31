// Structured exercise database with categorization and metadata
// This provides a comprehensive list of exercises with useful information

const exerciseDatabase = {
  // STRENGTH & RESISTANCE TRAINING
  strengthResistance: {
    category: "Strength & Resistance",
    exercises: [
      // Chest
      { name: "Push-up", muscles: ["chest", "shoulders", "triceps"], equipment: "bodyweight" },
      { name: "Bench Press", muscles: ["chest", "shoulders", "triceps"], equipment: "barbell" },
      { name: "Incline Press", muscles: ["upper chest", "shoulders"], equipment: "barbell/dumbbell" },
      { name: "Decline Press", muscles: ["lower chest", "triceps"], equipment: "barbell/dumbbell" },
      { name: "Chest Fly", muscles: ["chest"], equipment: "dumbbell/machine" },
      { name: "Dumbbell Pullover", muscles: ["chest", "lats"], equipment: "dumbbell" },
      { name: "Cable Crossover", muscles: ["chest"], equipment: "cable machine" },
      { name: "Push-up Variations", muscles: ["chest", "shoulders", "triceps"], equipment: "bodyweight" },
      
      // Back
      { name: "Pull-up", muscles: ["lats", "biceps"], equipment: "bar" },
      { name: "Lat Pulldown", muscles: ["lats", "biceps"], equipment: "machine" },
      { name: "Seated Row", muscles: ["mid-back", "biceps"], equipment: "machine/cable" },
      { name: "Bent-Over Row", muscles: ["back", "biceps"], equipment: "barbell/dumbbell" },
      { name: "T-Bar Row", muscles: ["mid-back", "lats"], equipment: "barbell" },
      { name: "Face Pull", muscles: ["rear delts", "upper back"], equipment: "cable" },
      { name: "Straight Arm Pulldown", muscles: ["lats"], equipment: "cable" },
      { name: "Single-Arm Dumbbell Row", muscles: ["back", "biceps"], equipment: "dumbbell" },
      
      // Shoulders
      { name: "Shoulder Press", muscles: ["shoulders", "triceps"], equipment: "barbell/dumbbell" },
      { name: "Arnold Press", muscles: ["shoulders"], equipment: "dumbbell" },
      { name: "Lateral Raise", muscles: ["side delts"], equipment: "dumbbell/cable" },
      { name: "Front Raise", muscles: ["front delts"], equipment: "dumbbell/plate" },
      { name: "Reverse Fly", muscles: ["rear delts"], equipment: "dumbbell/machine" },
      { name: "Upright Row", muscles: ["traps", "shoulders"], equipment: "barbell/dumbbell" },
      { name: "Shrugs", muscles: ["traps"], equipment: "barbell/dumbbell" },
      { name: "Military Press", muscles: ["shoulders", "triceps"], equipment: "barbell" },
      
      // Arms
      { name: "Bicep Curl", muscles: ["biceps"], equipment: "barbell/dumbbell" },
      { name: "Hammer Curl", muscles: ["biceps", "forearms"], equipment: "dumbbell" },
      { name: "Tricep Extension", muscles: ["triceps"], equipment: "dumbbell/cable" },
      { name: "Skull Crusher", muscles: ["triceps"], equipment: "barbell/dumbbell" },
      { name: "Preacher Curl", muscles: ["biceps"], equipment: "barbell/dumbbell" },
      { name: "Concentration Curl", muscles: ["biceps"], equipment: "dumbbell" },
      { name: "Dips", muscles: ["triceps", "chest"], equipment: "bodyweight/machine" },
      { name: "Tricep Pushdown", muscles: ["triceps"], equipment: "cable" },
      { name: "EZ Bar Curl", muscles: ["biceps"], equipment: "EZ bar" },
      { name: "Wrist Curl", muscles: ["forearms"], equipment: "dumbbell/barbell" },
      { name: "Reverse Wrist Curl", muscles: ["forearms"], equipment: "dumbbell/barbell" },
      
      // Legs
      { name: "Squat", muscles: ["quadriceps", "glutes", "hamstrings"], equipment: "barbell" },
      { name: "Front Squat", muscles: ["quadriceps", "core"], equipment: "barbell" },
      { name: "Goblet Squat", muscles: ["quadriceps", "glutes"], equipment: "kettlebell/dumbbell" },
      { name: "Deadlift", muscles: ["hamstrings", "glutes", "back"], equipment: "barbell" },
      { name: "Romanian Deadlift", muscles: ["hamstrings", "glutes"], equipment: "barbell/dumbbell" },
      { name: "Sumo Deadlift", muscles: ["inner thighs", "glutes", "hamstrings"], equipment: "barbell" },
      { name: "Leg Press", muscles: ["quadriceps", "glutes"], equipment: "machine" },
      { name: "Lunges", muscles: ["quadriceps", "glutes", "hamstrings"], equipment: "bodyweight/dumbbell" },
      { name: "Bulgarian Split Squat", muscles: ["quadriceps", "glutes"], equipment: "dumbbell/bodyweight" },
      { name: "Step-Ups", muscles: ["quadriceps", "glutes"], equipment: "box/bench" },
      { name: "Calf Raise", muscles: ["calves"], equipment: "machine/dumbbell" },
      { name: "Hip Thrust", muscles: ["glutes", "hamstrings"], equipment: "barbell" },
      { name: "Glute Bridge", muscles: ["glutes"], equipment: "bodyweight/barbell" },
      { name: "Hamstring Curl", muscles: ["hamstrings"], equipment: "machine" },
      { name: "Leg Extension", muscles: ["quadriceps"], equipment: "machine" },
      { name: "Hack Squat", muscles: ["quadriceps"], equipment: "machine" },
      { name: "Good Mornings", muscles: ["hamstrings", "lower back"], equipment: "barbell" },
      
      // Full Body / Compound
      { name: "Kettlebell Swing", muscles: ["glutes", "hamstrings", "back", "shoulders"], equipment: "kettlebell" },
      { name: "Medicine Ball Slam", muscles: ["full body", "core"], equipment: "medicine ball" },
      { name: "Box Jump", muscles: ["quadriceps", "calves"], equipment: "box" },
      { name: "Clean", muscles: ["full body"], equipment: "barbell" },
      { name: "Clean and Jerk", muscles: ["full body"], equipment: "barbell" },
      { name: "Snatch", muscles: ["full body"], equipment: "barbell" },
      { name: "Thruster", muscles: ["legs", "shoulders", "core"], equipment: "barbell/dumbbell" },
      { name: "Turkish Get-Up", muscles: ["full body", "core", "shoulders"], equipment: "kettlebell/dumbbell" },
      { name: "Farmer's Walk", muscles: ["forearms", "traps", "core"], equipment: "dumbbells/kettlebells" },
    ]
  },
  
  // CORE TRAINING
  core: {
    category: "Core",
    exercises: [
      { name: "Plank", muscles: ["core", "shoulders"], equipment: "bodyweight" },
      { name: "Side Plank", muscles: ["obliques", "core"], equipment: "bodyweight" },
      { name: "Sit-up", muscles: ["abs"], equipment: "bodyweight" },
      { name: "Crunch", muscles: ["abs"], equipment: "bodyweight" },
      { name: "Russian Twist", muscles: ["obliques", "abs"], equipment: "bodyweight/weight" },
      { name: "Mountain Climbers", muscles: ["abs", "hip flexors"], equipment: "bodyweight" },
      { name: "Hanging Leg Raise", muscles: ["lower abs", "hip flexors"], equipment: "pull-up bar" },
      { name: "V-Up", muscles: ["abs", "hip flexors"], equipment: "bodyweight" },
      { name: "Ab Wheel Rollout", muscles: ["abs", "core", "shoulders"], equipment: "ab wheel" },
      { name: "Bicycle Crunch", muscles: ["abs", "obliques"], equipment: "bodyweight" },
      { name: "Dead Bug", muscles: ["deep core"], equipment: "bodyweight" },
      { name: "Bird Dog", muscles: ["core", "lower back"], equipment: "bodyweight" },
      { name: "Hollow Hold", muscles: ["abs", "core"], equipment: "bodyweight" },
      { name: "Flutter Kick", muscles: ["lower abs"], equipment: "bodyweight" },
      { name: "Superman", muscles: ["lower back", "glutes"], equipment: "bodyweight" },
      { name: "Oblique Crunch", muscles: ["obliques"], equipment: "bodyweight" },
      { name: "Medicine Ball Rotation", muscles: ["obliques", "core"], equipment: "medicine ball" },
      { name: "Dragon Flag", muscles: ["entire core"], equipment: "bench" },
      { name: "Windshield Wiper", muscles: ["obliques", "core"], equipment: "bodyweight" },
      { name: "Cable Woodchopper", muscles: ["obliques", "core"], equipment: "cable machine" },
    ]
  },
  
  // CARDIO TRAINING
  cardio: {
    category: "Cardio",
    exercises: [
      { name: "Running", muscles: ["legs", "cardiovascular"], equipment: "none/treadmill" },
      { name: "Cycling", muscles: ["legs", "cardiovascular"], equipment: "bike" },
      { name: "Rowing", muscles: ["back", "arms", "legs", "cardiovascular"], equipment: "rowing machine" },
      { name: "Swimming", muscles: ["full body", "cardiovascular"], equipment: "pool" },
      { name: "Jump Rope", muscles: ["calves", "shoulders", "cardiovascular"], equipment: "jump rope" },
      { name: "Stair Climber", muscles: ["legs", "cardiovascular"], equipment: "stair machine" },
      { name: "Elliptical", muscles: ["full body", "cardiovascular"], equipment: "elliptical machine" },
      { name: "Sprints", muscles: ["legs", "cardiovascular"], equipment: "none" },
      { name: "High Knees", muscles: ["legs", "core", "cardiovascular"], equipment: "none" },
      { name: "Jumping Jacks", muscles: ["full body", "cardiovascular"], equipment: "none" },
      { name: "Battle Ropes", muscles: ["arms", "shoulders", "core", "cardiovascular"], equipment: "battle ropes" },
      { name: "Burpees", muscles: ["full body", "cardiovascular"], equipment: "none" },
      { name: "Box Step-Ups", muscles: ["legs", "cardiovascular"], equipment: "box" },
      { name: "Hill Sprints", muscles: ["legs", "cardiovascular"], equipment: "hill" },
      { name: "Sled Push/Pull", muscles: ["legs", "core", "cardiovascular"], equipment: "sled" },
      { name: "Assault Bike", muscles: ["full body", "cardiovascular"], equipment: "assault bike" },
      { name: "Ski Erg", muscles: ["upper body", "core", "cardiovascular"], equipment: "ski erg machine" },
      { name: "Hiking", muscles: ["legs", "cardiovascular"], equipment: "none" },
    ]
  },
  
  // FLEXIBILITY & MOBILITY
  flexibilityMobility: {
    category: "Flexibility & Mobility",
    exercises: [
      { name: "Yoga Flow", muscles: ["full body"], equipment: "yoga mat" },
      { name: "Sun Salutation", muscles: ["full body"], equipment: "yoga mat" },
      { name: "Child Pose", muscles: ["back", "hips"], equipment: "yoga mat" },
      { name: "Cat-Cow", muscles: ["spine"], equipment: "yoga mat" },
      { name: "Downward Dog", muscles: ["shoulders", "hamstrings", "calves"], equipment: "yoga mat" },
      { name: "Pigeon Pose", muscles: ["hips", "glutes"], equipment: "yoga mat" },
      { name: "Cobra Stretch", muscles: ["abs", "chest"], equipment: "yoga mat" },
      { name: "Butterfly Stretch", muscles: ["groin", "inner thighs"], equipment: "yoga mat" },
      { name: "Hip Flexor Stretch", muscles: ["hip flexors"], equipment: "yoga mat" },
      { name: "Quad Stretch", muscles: ["quadriceps"], equipment: "none" },
      { name: "Hamstring Stretch", muscles: ["hamstrings"], equipment: "none" },
      { name: "Shoulder Stretch", muscles: ["shoulders"], equipment: "none" },
      { name: "Tricep Stretch", muscles: ["triceps"], equipment: "none" },
      { name: "Neck Stretch", muscles: ["neck"], equipment: "none" },
      { name: "Wrist Mobility", muscles: ["wrists"], equipment: "none" },
      { name: "Ankle Mobility", muscles: ["ankles"], equipment: "none" },
      { name: "Foam Rolling", muscles: ["various"], equipment: "foam roller" },
      { name: "Dynamic Stretching", muscles: ["various"], equipment: "none" },
    ]
  },
  
  // CALISTHENICS / ADVANCED BODYWEIGHT
  calisthenics: {
    category: "Calisthenics",
    exercises: [
      { name: "Handstand Push-up", muscles: ["shoulders", "triceps"], equipment: "wall/none" },
      { name: "Muscle-up", muscles: ["upper body"], equipment: "bar/rings" },
      { name: "Rope Climb", muscles: ["upper body", "grip"], equipment: "rope" },
      { name: "Human Flag", muscles: ["core", "shoulders", "arms"], equipment: "pole" },
      { name: "Front Lever", muscles: ["core", "lats"], equipment: "bar" },
      { name: "Back Lever", muscles: ["back", "core"], equipment: "bar" },
      { name: "Planche", muscles: ["shoulders", "core", "chest"], equipment: "none" },
      { name: "L-Sit", muscles: ["core", "hip flexors"], equipment: "parallel bars/floor" },
      { name: "Pistol Squat", muscles: ["legs", "balance"], equipment: "none" },
      { name: "Archer Push-up", muscles: ["chest", "shoulders", "triceps"], equipment: "none" },
      { name: "One-Arm Push-up", muscles: ["chest", "core", "triceps"], equipment: "none" },
      { name: "Handstand Hold", muscles: ["shoulders", "core", "balance"], equipment: "wall/none" },
      { name: "Dragon Flag", muscles: ["core"], equipment: "bench" },
      { name: "Muscle-Up Transition", muscles: ["upper body"], equipment: "bar/rings" },
      { name: "Ring Dips", muscles: ["chest", "triceps"], equipment: "gymnastic rings" },
    ]
  },
  
  // SPORT SPECIFIC
  sportSpecific: {
    category: "Sport Specific",
    exercises: [
      { name: "Box Jumps", muscles: ["legs", "explosive power"], equipment: "box" },
      { name: "Medicine Ball Throws", muscles: ["core", "upper body", "power"], equipment: "medicine ball" },
      { name: "Agility Ladder Drills", muscles: ["footwork", "coordination"], equipment: "agility ladder" },
      { name: "Cone Drills", muscles: ["agility", "speed"], equipment: "cones" },
      { name: "Vertical Jump", muscles: ["legs", "explosive power"], equipment: "none" },
      { name: "Broad Jump", muscles: ["legs", "explosive power"], equipment: "none" },
      { name: "Depth Jump", muscles: ["legs", "reactive strength"], equipment: "box" },
      { name: "Resistance Band Sprints", muscles: ["speed", "acceleration"], equipment: "resistance bands" },
      { name: "Reaction Ball Drills", muscles: ["hand-eye coordination"], equipment: "reaction ball" },
      { name: "Shuttle Runs", muscles: ["speed", "agility"], equipment: "cones" },
      { name: "Single-Leg Balance", muscles: ["balance", "proprioception"], equipment: "none/balance pad" },
      { name: "Lateral Bound", muscles: ["lateral movement", "power"], equipment: "none" },
      { name: "Rotational Med Ball Throw", muscles: ["rotational power", "core"], equipment: "medicine ball" },
    ]
  },
  
  // OTHER / MISCELLANEOUS
  other: {
    category: "Other",
    exercises: [
      { name: "Other", muscles: ["various"], equipment: "various" }
    ]
  }
};

// Convert the structured database into a flat array for the dropdown
const exerciseSuggestions = Object.values(exerciseDatabase)
  .flatMap(category => category.exercises.map(exercise => exercise.name));

// Export both the full database (for potential future features) and the flat list for the dropdown
export { exerciseDatabase, exerciseSuggestions };
export default exerciseSuggestions;
