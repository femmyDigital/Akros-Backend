const Notification = require("../../model/notification");

const getNotification = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({
      $or: [{ user: userId }, { user: null }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await Notification.findByIdAndUpdate(userId, {
      isRead: true,
    });

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      {
        $or: [{ user: userId }, { user: null }],
      },
      { isRead: true },
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotification, markAsRead, markAllAsRead };
