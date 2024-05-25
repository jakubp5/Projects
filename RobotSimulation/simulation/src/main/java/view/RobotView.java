package main.java.view;

import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;
import main.java.model.common.Robot;
import main.java.model.room.AutonomousRobot;
import main.java.model.common.Position;

/**
 * View class for the Robot
 */
public class RobotView {
    private static final int ROBOT_SIZE = 10;

    /**
     * Draw the robot
     * @param robot the robot to draw
     * @param gc the graphics context to draw on
     */
    public void draw(Robot robot, GraphicsContext gc) {
        Position position = robot.getPosition();

        double x = position.getX();
        double y = position.getY();

        // Set color based on robot type (red for autonomous, yellow for controlled)
        if (robot instanceof AutonomousRobot) {
            gc.setFill(Color.RED);
        } else {
            gc.setFill(Color.YELLOW);
        }

        // Draw robot body
        gc.fillOval(x - ROBOT_SIZE / 2, y - ROBOT_SIZE / 2, ROBOT_SIZE, ROBOT_SIZE);
    }

}
