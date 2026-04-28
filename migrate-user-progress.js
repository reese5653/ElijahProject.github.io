/*
One-time progress migration script.

What it does:
- Maps users by email from OLD Firebase Auth to NEW Firebase Auth.
- Copies users/{uid} document from OLD Firestore to NEW Firestore.
- Copies known progress subcollections from OLD to NEW.

Usage examples:
node migrate-user-progress.js --oldKey "C:/keys/old.json" --newKey "C:/keys/new.json" --email "student@example.com"
node migrate-user-progress.js --oldKey "C:/keys/old.json" --newKey "C:/keys/new.json" --all
node migrate-user-progress.js --oldKey "C:/keys/old.json" --newKey "C:/keys/new.json" --all --dryRun
*/

const fs = require("fs");
const admin = require("firebase-admin");

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function requireArg(args, key) {
  if (!args[key]) {
    throw new Error(`Missing --${key}`);
  }
}

function loadServiceAccount(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Service account file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

async function listAllAuthUsers(auth) {
  let pageToken;
  const users = [];

  do {
    const result = await auth.listUsers(1000, pageToken);
    users.push(...result.users);
    pageToken = result.pageToken;
  } while (pageToken);

  return users;
}

async function getUserByEmailSafe(auth, email) {
  try {
    return await auth.getUserByEmail(email);
  } catch (err) {
    if (String(err?.code || "").includes("user-not-found")) {
      return null;
    }
    throw err;
  }
}

async function copyUserDoc(oldDb, newDb, oldUid, newUid, dryRun) {
  const sourceRef = oldDb.collection("users").doc(oldUid);
  const targetRef = newDb.collection("users").doc(newUid);

  const sourceSnap = await sourceRef.get();
  if (!sourceSnap.exists) {
    return { copied: false, reason: "missing source user doc" };
  }

  if (!dryRun) {
    await targetRef.set(sourceSnap.data(), { merge: true });
  }

  return { copied: true, reason: "ok" };
}

async function copySubcollection(oldDb, newDb, oldUid, newUid, name, dryRun) {
  const sourceCol = oldDb.collection("users").doc(oldUid).collection(name);
  const targetCol = newDb.collection("users").doc(newUid).collection(name);

  const sourceDocs = await sourceCol.get();
  if (sourceDocs.empty) {
    return 0;
  }

  let count = 0;
  for (const docSnap of sourceDocs.docs) {
    if (!dryRun) {
      await targetCol.doc(docSnap.id).set(docSnap.data(), { merge: true });
    }
    count++;
  }

  return count;
}

async function resolveUserPairs(oldAuth, newAuth, args) {
  if (args.email) {
    const email = String(args.email).trim().toLowerCase();
    const oldUser = await getUserByEmailSafe(oldAuth, email);
    const newUser = await getUserByEmailSafe(newAuth, email);
    if (!oldUser) {
      throw new Error(`Email not found in OLD Auth: ${email}`);
    }
    if (!newUser) {
      throw new Error(`Email not found in NEW Auth: ${email}`);
    }
    return [{ email, oldUid: oldUser.uid, newUid: newUser.uid }];
  }

  if (!args.all) {
    throw new Error("Provide either --email user@example.com or --all");
  }

  const [oldUsers, newUsers] = await Promise.all([
    listAllAuthUsers(oldAuth),
    listAllAuthUsers(newAuth),
  ]);

  const newByEmail = new Map(
    newUsers
      .filter((u) => !!u.email)
      .map((u) => [String(u.email).toLowerCase(), u])
  );

  const pairs = [];
  for (const oldUser of oldUsers) {
    if (!oldUser.email) continue;
    const email = String(oldUser.email).toLowerCase();
    const mapped = newByEmail.get(email);
    if (mapped) {
      pairs.push({ email, oldUid: oldUser.uid, newUid: mapped.uid });
    }
  }

  return pairs;
}

async function main() {
  const args = parseArgs(process.argv);
  requireArg(args, "oldKey");
  requireArg(args, "newKey");

  const oldKey = loadServiceAccount(args.oldKey);
  const newKey = loadServiceAccount(args.newKey);
  const dryRun = !!args.dryRun;

  const oldApp = admin.initializeApp(
    { credential: admin.credential.cert(oldKey) },
    "old"
  );
  const newApp = admin.initializeApp(
    { credential: admin.credential.cert(newKey) },
    "new"
  );

  const oldAuth = oldApp.auth();
  const newAuth = newApp.auth();
  const oldDb = oldApp.firestore();
  const newDb = newApp.firestore();

  const collectionsToCopy = [
    "quizzes",
    "notes",
    "quizDrafts",
    "bookmarks",
    "certificates",
    "studySessions",
  ];

  const pairs = await resolveUserPairs(oldAuth, newAuth, args);
  if (!pairs.length) {
    console.log("No matching users to migrate.");
    return;
  }

  console.log(`Users to migrate: ${pairs.length}`);
  if (dryRun) {
    console.log("Running in dry-run mode. No writes will be performed.");
  }

  let migratedUsers = 0;
  for (const pair of pairs) {
    const { email, oldUid, newUid } = pair;
    const header = `[${email}] old=${oldUid} -> new=${newUid}`;
    try {
      const docResult = await copyUserDoc(oldDb, newDb, oldUid, newUid, dryRun);
      if (!docResult.copied) {
        console.log(`${header} | skipped (${docResult.reason})`);
        continue;
      }

      const copiedCounts = {};
      for (const name of collectionsToCopy) {
        copiedCounts[name] = await copySubcollection(oldDb, newDb, oldUid, newUid, name, dryRun);
      }

      migratedUsers++;
      console.log(`${header} | migrated`, copiedCounts);
    } catch (err) {
      console.error(`${header} | failed:`, err.message || err);
    }
  }

  console.log(`Migration complete. Migrated users: ${migratedUsers}/${pairs.length}`);
}

main().catch((err) => {
  console.error("Migration failed:", err.message || err);
  process.exit(1);
});
