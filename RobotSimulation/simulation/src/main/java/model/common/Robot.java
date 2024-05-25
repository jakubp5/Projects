package main.java.model.common;

/**
 * Interface for robot
 */
public interface Robot {
    /**
     * Turn the robot
     */
    void turn();

    /**
     * Turn the robot
     * @param angle the angle to turn
     */
    void turn(int angle);

    double angle();


    /**
     * Check if the robot can move
     * @return true if the robot can move
     */
    boolean canMove();


    /**
     * Move the robot
     * @return true if the robot moved
     */
    boolean move();

    /**
     * Get the position of the robot
     * @return the position of the robot
     */
    Position getPosition();

    /**
     * Returns json representation of the robot
     * @return the robot in json format
     */
    String toString();
}