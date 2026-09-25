import { defineQuery } from 'next-sanity';

export const ASK_THREAD_PAGE_QUERY = defineQuery(`{
  "total": count(*[_type == "question" && !defined(thread) && status == "published"]),
  "threads": *[_type == "question" && !defined(thread) && status == "published"]{
    _id,
    "slug": slug.current,
    body,
    submittedAt,
    "author": author{kind, name, avatarUrl, avatarSeed, "isOwner": providerId in $ownerIds},
    "replyCount": count(*[_type == "question" && thread._ref == ^._id && status == "published"]),
    "lastActivityAt": coalesce(
      *[_type == "question" && thread._ref == ^._id && status == "published"] | order(submittedAt desc)[0].submittedAt,
      submittedAt
    )
  } | order(lastActivityAt desc)[$start...$end]
}`);

export const ASK_THREAD_QUERY = defineQuery(`
  *[_type == "question" && !defined(thread) && status == "published" && slug.current == $slug][0]{
    _id,
    "slug": slug.current,
    submittedAt,
    body,
    editedAt,
    deletedAt,
    "author": author{kind, name, avatarUrl, avatarSeed, "isOwner": providerId in $ownerIds},
    "reactions": reactions[].emoji,
    "replies": *[_type == "question" && thread._ref == ^._id && status == "published"] | order(submittedAt asc){
      _id,
      body,
      submittedAt,
      editedAt,
      deletedAt,
      "author": author{kind, name, avatarUrl, avatarSeed, "isOwner": providerId in $ownerIds},
      "isThreadAuthor": author.providerId == ^.author.providerId,
      "reactions": reactions[].emoji
    }
  }
`);

export const ASK_THREAD_INDEX_QUERY = defineQuery(`
  *[_type == "question" && !defined(thread) && status == "published"]{
    "slug": slug.current,
    body,
    "lastActivityAt": coalesce(
      *[_type == "question" && thread._ref == ^._id && status == "published"] | order(submittedAt desc)[0].submittedAt,
      submittedAt
    )
  } | order(lastActivityAt desc)
`);

export const ASK_PENDING_COUNT_QUERY = defineQuery(
  `count(*[_type == "question" && status == "pending"])`,
);

export const ASK_REPLY_TARGET_QUERY = defineQuery(`
  *[_type == "question" && !defined(thread) && status == "published" && slug.current == $slug][0]{_id}
`);

export const ASK_ACTIVITY_QUERY = defineQuery(`{
  "banned": count(*[_type == "askBan" && (providerId == $providerId || ipHash == $ipHash)]) > 0,
  "questionsToday": count(*[_type == "question" && !defined(thread) && author.providerId == $providerId && submittedAt > $dayAgo]),
  "repliesLastHour": count(*[_type == "question" && defined(thread) && author.providerId == $providerId && submittedAt > $hourAgo]),
  "heldNow": count(*[_type == "question" && author.providerId == $providerId && status in ["pending", "spam"]]),
  "postsToday": count(*[_type == "question" && author.providerId == $providerId && submittedAt > $dayAgo]),
  "postsTodayByIp": count(*[_type == "question" && moderation.ipHash == $ipHash && submittedAt > $dayAgo]),
  "duplicate": *[
    _type == "question" &&
    author.providerId == $providerId &&
    coalesce(thread._ref, "") == $threadId &&
    body == $body &&
    submittedAt > $hourAgo
  ][0]{
    _id,
    status,
    body,
    submittedAt,
    "slug": slug.current,
    "name": author.name,
    "avatarSeed": author.avatarSeed
  }
}`);

export const ASK_MESSAGE_QUERY = defineQuery(`
  *[_type == "question" && _id == $id][0]{
    _id,
    submittedAt,
    deletedAt,
    "providerId": author.providerId,
    "visible": status == "published" && coalesce(thread->status, "published") == "published",
    "banned": count(*[_type == "askBan" && providerId == $providerId]) > 0
  }
`);

export const ASK_VIEWER_QUERY = defineQuery(`{
  "thread": *[_type == "question" && !defined(thread) && status == "published" && slug.current == $slug][0]{
    "slug": slug.current,
    "messages": *[_type == "question" && (_id == ^._id || thread._ref == ^._id)]{
      _id,
      body,
      status,
      submittedAt,
      deletedAt,
      "providerId": author.providerId,
      "name": author.name,
      "avatarSeed": author.avatarSeed,
      "reacted": reactions[providerId == $providerId].emoji
    }
  },
  "heldQuestions": *[
    _type == "question" && !defined(thread) && author.providerId == $providerId && status in ["pending", "spam"]
  ] | order(submittedAt desc){_id, body, submittedAt, "name": author.name, "avatarSeed": author.avatarSeed}
}`);
