function parsePagination(query, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit || String(defaultLimit), 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function paginatedResponse(data, total, page, limit) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

module.exports = { parsePagination, paginatedResponse };
