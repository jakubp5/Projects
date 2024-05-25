package main.java.model.common;

import java.io.File;
import java.util.List;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import main.java.controller.RobotController;

/**
 * Interface for the environment
 */
public interface Environment {

    /**
     * Add a robot to the environment
     * @param robot the robot to add
     * @return true if the robot was added
     */
    boolean addRobot(Robot robot);

    /**
     * Check if the environment contains a position
     * @param pos the position to check
     * @return true if the position is in the environment
     */
    boolean containsPosition(Position pos);

    /**
     * Create an obstacle at a position
     * @param p the position to create the obstacle
     * @return true if the obstacle was created
     */
    boolean createObstacleAt(Position p);

    /**
     * Create an obstacle at a position
     * @param x the x coordinate of the position
     * @param y the y coordinate of the position
     * @return true if the obstacle was created
     */
    boolean createObstacleAt(double x, double y);

    /**
     * Check if there is an obstacle at a position
     * @param p the position to check
     * @return true if there is an obstacle at the position
     */
    boolean obstacleAt(Position p);

    /**
     * Check if there is a robot at a position
     * @param p the position to check
     * @return true if there is a robot at the position
     */
    boolean robotAt(Position p);

    /**
     * Get list of robots
     * @return list of robots
     */
    List<Robot> getRobots();

    /**
     * Get list of obstacles
     * @return list of obstacles
     */
    List<Obstacle> getObstacles();

    /**
     * Logs the environment
     */
    void log();

    /**
     * Stops logging the environment
     */
    void stopLog();

    /**
     * Clears the log
     */
    void clearLog();

    /**
     * Save the environment
     */
    void save();

    /**
     * Preload the environment
     * @param file the file to preload
     */
    void preload(File file);

    /**
     * Load the environment
     * @param json the json object to load
     */
    void load(JsonObject json);


    void rewind(RobotController robotController);

    /**
     * Clear the environment
     */
    void clear();

    /**
     * Get the width of the environment
     * @return the width of the environment
     */
    double getWidth();

    /**
     * Get the height of the environment
     * @return the height of the environment
     */
    double getHeight();
}
