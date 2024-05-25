package main.java.model.room;

import main.java.model.common.Environment;
import main.java.model.common.Obstacle;
import main.java.model.common.Position;
import main.java.model.common.Robot;

/**
 * Represents a controlled robot in the environment
 */
public class ControlledRobot implements Robot {
    private final Environment environment;
    private final int ROBOT_SIZE = 10;
    private final int OBSTACLE_SIZE = 20;

    private Position position;
    private double current_angle;
    private int id;
    private double speed;

    /**
     * Create a controlled robot at a position
     *
     * @param environment the environment
     * @param position    the position
     * @param id          the id
     * @param speed       the speed
     */
    private ControlledRobot(Environment environment, Position position, int id, double speed) {
        this.environment = environment;
        this.position = position;
        this.current_angle = 0;
        this.id = id;
        this.speed = speed;
    }

    /**
     * Create a controlled robot at a position
     *
     * @param env     the environment
     * @param pos     the position
     * @param id      the id
     * @param speed   the speed
     * @return the controlled robot
     */
    public static ControlledRobot create(Environment env, Position pos, int id, double speed) {
        if (!env.containsPosition(pos) || env.robotAt(pos) || env.obstacleAt(pos)) {
            return null;
        } else {
            ControlledRobot robot = new ControlledRobot(env, pos, id, speed);
            env.addRobot(robot);
            return robot;
        }
    }

    public double angle() {
        return current_angle;
    }

    public void turn(int n) {
        if (n > 0) {
            current_angle = (current_angle + 10) % 360;
        } else {
            current_angle = (current_angle + (360 - 10)) % 360;
        }
    }

    public boolean canMove() {
        // Calculate the next position of the robot
        Position next = getNextPosition(speed);
        double nextX = next.getX();
        double nextY = next.getY();

        // Check if the next position is within the environment boundaries
        if (!environment.containsPosition(next)) {
            return false;
        }

        // Check if the next position is within the bounds of the environment,
        // considering the robot's size
        if (nextX < 5 || nextY < 5 || nextX > environment.getWidth() - 5 || nextY > environment.getHeight() - 5) {
            return false;
        }

        // Check if the next position collides with any obstacle
        for (Obstacle obstacle : environment.getObstacles()) {
            double obstacleX = obstacle.getPosition().getX();
            double obstacleY = obstacle.getPosition().getY();

            // Calculate the minimum and maximum x and y coordinates of the obstacle
            double obstacleMaxX = obstacleX + OBSTACLE_SIZE / 2;
            double obstacleMinX = obstacleX - OBSTACLE_SIZE / 2;
            double obstacleMinY = obstacleY - OBSTACLE_SIZE / 2;
            double obstacleMaxY = obstacleY + OBSTACLE_SIZE / 2;

            // Calculate the closest point on the obstacle's boundary to the next position
            double closestX = Math.max(obstacleMinX, Math.min(nextX, obstacleMaxX));
            double closestY = Math.max(obstacleMinY, Math.min(nextY, obstacleMaxY));

            // Calculate the distance between the closest point and the next position
            double distance = Math.sqrt(Math.pow(nextX - closestX, 2) + Math.pow(nextY - closestY, 2));

            // Check if a collision occurred
            if (distance < ROBOT_SIZE / 2) {
                return false;
            }
        }

        return true;
    }

    public Position getPosition() {
        return position;
    }

    public boolean move() {
        if (canMove()) {
            position = getNextPosition(speed);
            return true;
        }

        return false;
    }

    public void turn() {
        current_angle = (current_angle + 45) % 360;
    }

    private Position getNextPosition(double distance) {
        double x = position.getX();
        double y = position.getY();

        double rad = Math.toRadians(current_angle);

        double dx = distance * Math.cos(rad);
        double dy = distance * Math.sin(rad);

        double new_x = x + dx;
        double new_y = y + dy;

        return new Position(new_x, new_y);
    }

    @Override
    public String toString() {
        return "{ \"Controlled\": " + true + ", \"id\": " + id + ", \"x\": " + position.getX() + ", \"y\": "
                + position.getY() + ", \"currentAngle\": " + current_angle + ", \"speed\": " + speed + ", \"turnAngle\": " + 1.0 + " }";
    }

}